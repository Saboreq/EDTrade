import { commodityKey, type Cargo, type Leg, type PlanResult, type Reference, type Route, type Settings, type Ship, type Snapshot, type Station } from './types';
export const distance=(a:{x:number;y:number;z:number},b:{x:number;y:number;z:number})=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export function eligibleStation(s:Station,ship:Ship,o:Settings,now=Date.now()) {
 const age=(now-Date.parse(s.updated))/3600000;
 return s.pad>=ship.pad && (s.arrival!==null? s.arrival<=o.maxArrival:o.unknown) && Number.isFinite(age)&&age>=-0.02&&age<=o.maxAgeHours && (!s.planetary||o.planetary)&&(!s.carrier||o.carriers)&&(!s.permit||o.permits)&&s.commodities.length>0;
}
export function travel(a:Station|Reference,b:Station,ship:Ship,o:Settings) {
 const ly=distance(a,b), same='system' in a?a.systemId===b.systemId:a.id===b.systemId;
 const jumps=same?0:Math.max(1,Math.ceil(ly/ship.jump));
 // A planning estimate, not a hyperspace route or a flight simulation.
 const sc=ship.sco?1.4+Math.sqrt((b.arrival??o.maxArrival)/1000)*0.55:1.7+Math.sqrt((b.arrival??o.maxArrival)/1000)*1.75;
 return {distance:ly,jumps,minutes:ship.dockingMinutes+sc+jumps*ship.jumpSeconds/60+(b.planetary?2:0)};
}
type Used=Record<string,number>;
const stockKey=(s:Station,k:string)=>`s:${s.id}:${k}`;
const demandKey=(s:Station,k:string)=>`d:${s.id}:${k}`;
export function cargoOptions(a:Station,b:Station,ship:Ship,o:Settings,balance:number,used:Used={}) {
 const banned=new Set(o.excluded.split(',').map(commodityKey).filter(Boolean));
 const dest=new Map(b.commodities.map(c=>[c.key,c]));
 const choices=a.commodities.flatMap(c=>{
   const d=dest.get(c.key);if(!d||c.buy<=0||d.sell<=0||banned.has(c.key)||a.prohibited.includes(c.key)||b.prohibited.includes(c.key))return [];
   const margin=d.sell*(1-o.haircut)-c.buy;
   if(margin<o.minMargin)return [];
   // Zero demand is unknown / unavailable here, never silently infinite.
   const supply=Math.max(0,c.supply-(used[stockKey(a,c.key)]??0));
   const demand=Math.max(0,Math.floor(d.demand*o.demandFraction)-(used[demandKey(b,c.key)]??0));
   const limit=Math.min(supply,demand,ship.cargo);
   return limit>0?[{c,d,margin,limit}]:[];
 });
 const strategies=o.mixed?['margin','roi','cheap']:['single'];
 const results:{cargo:Cargo[];cost:number;profit:number;quantity:number}[]=[];
 const single=choices.map(c=>[c]);
 const lists=strategies[0]==='single'?single:strategies.map(mode=>[...choices].sort((a,b)=>mode==='roi'?b.margin/b.c.buy-a.margin/a.c.buy:mode==='cheap'?a.c.buy-b.c.buy:b.margin-a.margin));
 for(const list of lists){let remaining=ship.cargo,available=Math.max(0,balance-ship.reserve),cost=0,profit=0;const cargo:Cargo[]=[];
  for(const c of list){const n=Math.floor(Math.min(c.limit,remaining,available/c.c.buy));if(n<=0)continue;
   const buy=n*c.c.buy,p=n*c.margin;cargo.push({key:c.c.key,name:c.c.name,quantity:n,buy:c.c.buy,sell:c.d.sell,profit:p,supply:c.c.supply,demand:c.d.demand});cost+=buy;profit+=p;available-=buy;remaining-=n;}
  if(cargo.length){const signature=cargo.map(c=>c.key+':'+c.quantity).sort().join('|');if(!results.some(r=>r.cargo.map(c=>c.key+':'+c.quantity).sort().join('|')===signature))results.push({cargo,cost,profit,quantity:ship.cargo-remaining});}
 }
 return results.sort((a,b)=>b.profit-a.profit);
}
interface State {at:Station;origin:Station;balance:number;profit:number;minutes:number;initialMinutes:number;legs:Leg[];used:Used;visited:Set<string>}
export function planRoutes(snapshot:Snapshot,ship:Ship,o:Settings,progress?:(p:number)=>void):PlanResult {
 const t0=performance.now(),now=Date.now();
 if(ship.cargo<1||ship.jump<=0||ship.budget<=ship.reserve||o.hops<1)throw new Error('Check cargo, jump range and available trading budget.');
 const stations=snapshot.stations.filter(s=>eligibleStation(s,ship,o,now));
 const start=o.startStation.trim().toLowerCase();
 const roots=stations.filter(s=>start?(s.id===start||s.name.toLowerCase()===start):s.systemId===snapshot.reference.id);
 if(start&&!roots.length) return {routes:[],eligible:stations.length,considered:0,elapsedMs:performance.now()-t0,warnings:['Your starting station has no eligible market in this snapshot. Check its name or increase the market age / station filters.']};
 // If no start station specified, include repositioning to the first purchase.
 const firsts=start?roots:[...stations].sort((a,b)=>travel(snapshot.reference,a,ship,o).minutes-travel(snapshot.reference,b,ship,o).minutes).slice(0,48);
 let states:State[]=firsts.map(s=>{const move=travel(snapshot.reference,s,ship,o);return {at:s,origin:s,balance:ship.budget,profit:0,minutes:move.minutes,initialMinutes:move.minutes,legs:[],used:{},visited:new Set([s.id])};}).filter(s=>o.startStation?true:travel(snapshot.reference,s.at,ship,o).jumps<=o.maxJumps);
 if(start)states=states.map(s=>({...s,minutes:0,initialMinutes:0}));
 const edges=new Map<string,{to:Station;travel:ReturnType<typeof travel>}[]>();
 for(const s of stations)edges.set(s.id,stations.filter(d=>d.id!==s.id).map(d=>({to:d,travel:travel(s,d,ship,o)})).filter(e=>e.travel.jumps<=o.maxJumps));
 const completed:Route[]=[];let considered=0;
 const score=(s:{profit:number;minutes:number})=>o.objective==='profit'?s.profit:s.profit/Math.max(1,s.minutes);
 const destination=o.destination.trim().toLowerCase();
 for(let depth=0;depth<o.hops;depth++){
  const next:State[]=[];
  for(const state of states){
   for(const edge of edges.get(state.at.id)??[]){const to=edge.to;
    if(o.unique&&state.visited.has(to.id)&&!(o.mode==='loop'&&to.id===state.origin.id))continue;
    const operating=edge.travel.jumps*o.fuelCost;
    for(const load of cargoOptions(state.at,to,ship,o,state.balance-operating,state.used)){
     considered++;const profit=load.profit-operating;if(profit<=0)continue;
     const minutes=state.minutes+edge.travel.minutes;if(minutes>o.maxMinutes)continue;
     const balance=state.balance+profit;
     const leg:Leg={from:state.at,to,cargo:load.cargo,quantity:load.quantity,cost:load.cost,profit,minutes:edge.travel.minutes,distance:edge.travel.distance,jumps:edge.travel.jumps,balance};
     const used={...state.used};for(const c of load.cargo){used[stockKey(state.at,c.key)]=(used[stockKey(state.at,c.key)]??0)+c.quantity;used[demandKey(to,c.key)]=(used[demandKey(to,c.key)]??0)+c.quantity;}
     const ns:State={...state,at:to,balance,profit:state.profit+profit,minutes,legs:[...state.legs,leg],used,visited:new Set([...state.visited,to.id])};
     let terminal:Station|undefined,terminalMinutes=0;
     let valid=o.mode==='multi'||(o.mode==='loop'&&to.id===state.origin.id)||(o.mode==='destination'&&(to.system.toLowerCase()===destination||to.name.toLowerCase()===destination));
     if(o.mode==='loop'&&to.id!==state.origin.id&&depth===o.hops-1){terminal=state.origin;valid=true;}
     if(o.mode==='destination'&&!valid&&depth===o.hops-1){terminal=stations.filter(s=>s.system.toLowerCase()===destination||s.name.toLowerCase()===destination).sort((a,b)=>distance(to,a)-distance(to,b))[0];valid=Boolean(terminal);}
     let finishCost=0;
     if(terminal){const mv=travel(to,terminal,ship,o);terminalMinutes=mv.minutes;finishCost=mv.jumps*o.fuelCost;if(mv.jumps>o.maxJumps)valid=false;}
     if(valid&&minutes+terminalMinutes<=o.maxMinutes&&ns.profit>finishCost){const net=ns.profit-finishCost;completed.push({id:ns.legs.map(l=>l.from.id+'>'+l.to.id+':'+l.cargo.map(c=>c.key+c.quantity).join(',')).join('|'),legs:ns.legs,profit:net,minutes:minutes+terminalMinutes,rate:net*60/(minutes+terminalMinutes),balance:balance-finishCost,initialMinutes:state.initialMinutes,terminalMinutes,terminal,maxAgeHours:Math.max(...ns.legs.flatMap(l=>[l.from,l.to]).map(s=>(now-Date.parse(s.updated))/3600000))});}
     next.push(ns);
     if(next.length>3000){next.sort((a,b)=>score(b)-score(a));next.length=1000;}
     if(completed.length>1200){completed.sort((a,b)=>score(b)-score(a));completed.length=600;}
    }
   }
  }
  // Diverse bounded beam: retain several histories per destination, then a global beam.
  next.sort((a,b)=>score(b)-score(a));const perDestination=new Map<string,number>();
  states=next.filter(s=>{const key=s.at.id+':'+(o.mode==='loop'?s.origin.id:'');const n=perDestination.get(key)??0;perDestination.set(key,n+1);return n<3;}).slice(0,120);
  // Prevent result arrays from growing without bound on dense snapshots.
  completed.sort((a,b)=>score(b)-score(a));if(completed.length>600)completed.length=600;
  progress?.((depth+1)/o.hops);if(!states.length)break;
 }
 completed.sort((a,b)=>score(b)-score(a));const signatures=new Set<string>();
 const routes=completed.filter(r=>{const k=r.legs.map(l=>l.from.id+'>'+l.to.id).join('|');if(signatures.has(k))return false;signatures.add(k);return true;}).slice(0,12);
 const warnings=[...snapshot.warnings,'Travel times and jump counts are estimates. Check the in-game route, fuel and permit access before departure.','Prices are observed quotes. Actual sale prices may change with demand, cargo size and other players.'];
 if(!routes.length)warnings.unshift('No profitable route fits these settings. Try a longer market age, more station distance, a wider radius, or a lower minimum margin.');
 if(stations.some(s=>!s.permitKnown))warnings.push('Some markets omit permit metadata. Known restricted systems are filtered; verify unfamiliar systems in game.');
 return {routes,eligible:stations.length,considered,elapsedMs:performance.now()-t0,warnings};
}

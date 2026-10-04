import type {Cargo,Route,Station} from './types';
export interface TradeAction {type:'buy'|'sell';cargo:Cargo[];leg:number;}
export interface RouteStop {station:Station;actions:TradeAction[];distance:number;jumps:number;minutes:number;terminal:boolean;}
export function routeStops(route:Route):RouteStop[]{
 const first=route.legs[0];if(!first)return [];
 const stops:RouteStop[]=[{station:first.from,actions:[{type:'buy',cargo:first.cargo,leg:0}],distance:0,jumps:0,minutes:route.initialMinutes,terminal:false}];
 route.legs.forEach((leg,i)=>stops.push({station:leg.to,actions:[{type:'sell',cargo:leg.cargo,leg:i},...(route.legs[i+1]?[{type:'buy' as const,cargo:route.legs[i+1].cargo,leg:i+1}]:[])],distance:leg.distance,jumps:leg.jumps,minutes:leg.minutes,terminal:false}));
 if(route.terminal)stops.push({station:route.terminal,actions:[],distance:Math.hypot(route.terminal.x-stops.at(-1)!.station.x,route.terminal.y-stops.at(-1)!.station.y,route.terminal.z-stops.at(-1)!.station.z),jumps:0,minutes:route.terminalMinutes,terminal:true});
 return stops;
}
export function routeStats(route?:Route,maxAge=48,now=Date.now()){
 const stops=route?routeStops(route):[];const ages=stops.filter(s=>!s.terminal).map(s=>Math.max(0,(now-Date.parse(s.station.updated))/3600000)).filter(Number.isFinite);
 return {stops,distance:stops.reduce((n,s)=>n+s.distance,0),jumps:stops.reduce((n,s)=>n+s.jumps,0),fresh:ages.length?Math.round(ages.filter(a=>a<=maxAge).length/ages.length*100):0,minAge:ages.length?Math.min(...ages):0,maxAge:ages.length?Math.max(...ages):0};
}
export function shortAge(hours:number){return hours<1?Math.round(hours*60)+' min':Math.round(hours)+' h';}

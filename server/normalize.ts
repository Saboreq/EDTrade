import { commodityKey, type Station, type Snapshot } from '../src/lib/types';
type Raw = Record<string, any>;
const finite = (v:unknown): v is number => typeof v==='number' && Number.isFinite(v);
export function normalizeStation(r: Raw): Station | null {
  if (!r.name || !r.system_name || !r.market_id || ![r.system_x,r.system_y,r.system_z].every(finite)) return null;
  const pad = r.large_pads>0 ? 3 : r.medium_pads>0 ? 2 : r.small_pads>0 ? 1 : 0;
  return {id:String(r.market_id), name:r.name, system:r.system_name, systemId:String(r.system_id64), x:r.system_x,y:r.system_y,z:r.system_z,
    distance:finite(r.distance)?r.distance:0,arrival:finite(r.distance_to_arrival)?r.distance_to_arrival:null,pad,
    planetary:r.is_planetary===true,carrier:/carrier/i.test(r.type??''),permit:r.system_needs_permit===true || r.needs_permit===true,
    permitKnown:typeof r.system_needs_permit==='boolean'||typeof r.needs_permit==='boolean',
    prohibited:(r.prohibited_commodities??[]).map((c:any)=>commodityKey(typeof c==='string'?c:c.name??'')),
    services:(r.services??[]).map((c:any)=>typeof c==='string'?c:c.name),type:r.type??'Unknown',updated:r.market_updated_at??'',
    commodities:(Array.isArray(r.market)?r.market:[]).filter((c:any)=>c.commodity&&finite(c.buy_price)&&finite(c.sell_price)&&finite(c.supply)&&finite(c.demand)).map((c:any)=>({key:commodityKey(c.commodity),name:c.commodity,category:c.category??'Other',buy:Math.max(0,c.buy_price),sell:Math.max(0,c.sell_price),supply:Math.max(0,Math.floor(c.supply)),demand:Math.max(0,Math.floor(c.demand))}))};
}
export function normalizeSnapshot(pages: Raw[], radius:number): Snapshot {
  const seen=new Map<string,Station>();
  for(const page of pages) for(const r of page.results??[]) { const s=normalizeStation(r); if(s) seen.set(s.id,s); }
  const ref=pages[0]?.reference;
  if(!ref || !ref.name || ![ref.x,ref.y,ref.z].every(finite)) throw new Error('The provider did not return a valid reference system. Check the system name.');
  const total=Number(pages[0].count)||0;
  return {stations:[...seen.values()],reference:{name:ref.name,id:String(ref.id64),x:ref.x,y:ref.y,z:ref.z},fetchedAt:new Date().toISOString(),source:'Spansh / EDDN',total,loaded:seen.size,truncated:total>seen.size,radius,warnings:total>seen.size?[`Loaded ${seen.size} nearest matching markets out of ${total.toLocaleString()}. Results are optimized within this sample, not the whole galaxy.`]:[]};
}

import { z } from 'zod';
import { normalizeSnapshot } from './normalize';
import type { Snapshot } from '../src/lib/types';
export const marketQuery=z.object({system:z.string().trim().min(1).max(100), radius:z.coerce.number().min(10).max(300).default(80),maxArrival:z.coerce.number().min(100).max(1000000).default(2000),age:z.coerce.number().min(1).max(720).default(48),pad:z.coerce.number().int().min(1).max(3).default(3),planetary:z.enum(['true','false']).default('false'),carriers:z.enum(['true','false']).default('false'),permits:z.enum(['true','false']).default('false')});
export type MarketQuery=z.infer<typeof marketQuery>;
const cache=new Map<string,{expires:number;data:Snapshot}>();
const pending=new Map<string,Promise<Snapshot>>();
async function request(path:string,body?:unknown) {
  const response=await fetch('https://spansh.co.uk/api/'+path,{method:body?'POST':'GET',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(18000)});
  if(!response.ok) throw new Error(response.status===429?'Market provider is busy. Wait a minute and retry.':`Market provider returned HTTP ${response.status}. Please retry shortly.`);
  const data=await response.json();
  if(data.error) throw new Error(String(data.error).slice(0,180));
  return data;
}
export async function getMarkets(q:MarketQuery):Promise<Snapshot> {
  const key=JSON.stringify(q), hit=cache.get(key);
  if(hit&&hit.expires>Date.now())return hit.data;
  if(pending.has(key))return pending.get(key)!;
  const job=(async()=>{
    const before=new Date(Date.now()-q.age*3600000).toISOString();
    const filters:Record<string,unknown>={distance:{min:0,max:q.radius},distance_to_arrival:{min:0,max:q.maxArrival},has_market:{value:true},market_updated_at:{comparison:'<=>',value:[before,new Date(Date.now()+60000).toISOString()]}};
    if(q.pad===3)filters.has_large_pad={value:true};
    if(q.planetary==='false')filters.is_planetary={value:false};
    if(q.permits==='false')filters.system_needs_permit={value:false};
    if(q.carriers==='false')filters.type={value:['Fleet Carrier'],comparison:'!='};
    const query={filters,sort:[{distance:{direction:'asc'}}],size:250,page:0,reference_system:q.system};
    const first=await request('stations/search',query);
    if(!Array.isArray(first.results))throw new Error('Unexpected market provider response. Please retry.');
    const pages=[first];
    if(first.count>250)pages.push(await request('stations/search',{...query,page:1}));
    const result=normalizeSnapshot(pages,q.radius);
    // The optimizer also applies every filter locally. Never trust remote filters alone.
    if(cache.size>30)cache.delete(cache.keys().next().value!);
    cache.set(key,{expires:Date.now()+180000,data:result});return result;
  })();
  pending.set(key,job);try{return await job;}finally{pending.delete(key);}
}
export async function searchSystems(term:string) {
 const data=await request('systems/field_values/system_names?q='+encodeURIComponent(term));
 return (data.min_max??[]).slice(0,12).map((r:any)=>({name:r.name,id:String(r.id64),x:r.x,y:r.y,z:r.z}));
}

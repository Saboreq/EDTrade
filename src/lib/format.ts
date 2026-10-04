import type { Route } from './types';
export const number=(n:number)=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:0}).format(n);
export const credits=(n:number)=>Math.abs(n)>=1e6?(n/1e6).toFixed(2)+'M':number(n);
export const duration=(n:number)=>n<60?Math.ceil(n)+' min':Math.floor(n/60)+'h '+Math.ceil(n%60)+'m';
export const age=(timestamp:string)=>{const n=(Date.now()-Date.parse(timestamp))/3600000;return !Number.isFinite(n)?'Unknown':n<1?Math.max(0,Math.floor(n*60))+'m ago':n<48?Math.floor(n)+'h ago':Math.floor(n/24)+'d ago';};
const cell=(s:string|number)=>'"'+String(s).replace(/"/g,'""')+'"';
export function routeCSV(r:Route){const rows=[['Leg','Buy system','Buy station','Sell system','Sell station','Commodity','Tonnes','Buy Cr/t','Quoted sell Cr/t','Conservative profit Cr','Buy market timestamp','Sell market timestamp']];r.legs.forEach((l,i)=>l.cargo.forEach(c=>rows.push([String(i+1),l.from.system,l.from.name,l.to.system,l.to.name,c.name,String(c.quantity),String(c.buy),String(c.sell),String(Math.floor(c.profit)),l.from.updated,l.to.updated])));return rows.map(row=>row.map(cell).join(',')).join('\r\n');}
export function download(name:string,data:string,type='application/json'){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

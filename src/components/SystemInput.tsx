import { useEffect,useState,useId } from 'react';
import { Field } from './Fields';
export function SystemInput({label,value,onChange}:{label:string;value:string;onChange:(s:string)=>void}){
 const [suggestions,setSuggestions]=useState<{name:string}[]>([]),id=useId();
 useEffect(()=>{if(value.length<2){setSuggestions([]);return;}const ctrl=new AbortController();const timeout=setTimeout(()=>{fetch('/api/systems?q='+encodeURIComponent(value),{signal:ctrl.signal}).then(r=>r.ok?r.json():[]).then(data=>setSuggestions(Array.isArray(data)?data:[])).catch(()=>{});},500);return()=>{clearTimeout(timeout);ctrl.abort();};},[value]);
 return <Field label={label}><input value={value} onChange={e=>onChange(e.target.value)} list={id} maxLength={100} required autoComplete="off"/><datalist id={id}>{suggestions.map(s=><option key={s.name} value={s.name}/>)}</datalist></Field>;
}

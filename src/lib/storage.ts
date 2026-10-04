import { useState, useEffect } from 'react';
export function useStored<T>(key:string,fallback:T,validate?:(value:unknown)=>value is T):[T,(value:T|((old:T)=>T))=>void] {
 const [value,setValue]=useState<T>(()=>{try{const parsed=JSON.parse(localStorage.getItem(key)??'null');return parsed!==null&&(!validate||validate(parsed))?parsed:fallback;}catch{return fallback;}});
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Storage disabled or full: session still works. */}},[key,value]);return [value,setValue];
}

import type { VercelRequest,VercelResponse } from '@vercel/node';
import { searchSystems } from '../server/provider';
export default async function handler(req:VercelRequest,res:VercelResponse) {
 if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 const q=typeof req.query.q==='string'?req.query.q.trim():'';
 if(q.length<2||q.length>100)return res.status(400).json({error:'Enter 2–100 characters.'});
 try{res.setHeader('Cache-Control','public,s-maxage=3600');return res.status(200).json(await searchSystems(q));}catch{return res.status(502).json({error:'System search unavailable. You can enter an exact system name.'});}
}

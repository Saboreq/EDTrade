import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarkets, marketQuery } from '../server/provider';
export const config={maxDuration:60};
export default async function handler(req:VercelRequest,res:VercelResponse) {
 if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 const parsed=marketQuery.safeParse(req.query);
 if(!parsed.success)return res.status(400).json({error:parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')});
 try{const data=await getMarkets(parsed.data);res.setHeader('Cache-Control','public, s-maxage=180, stale-while-revalidate=60');return res.status(200).json(data);}catch(error){return res.status(502).json({error:error instanceof Error?error.message:'Unable to load market data.'});}
}

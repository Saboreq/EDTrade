import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getMarkets,marketQuery,searchSystems } from './server/provider';
export default defineConfig({plugins:[react(),{name:'local-api',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 if(!req.url?.startsWith('/api/'))return next();
 res.setHeader('Content-Type','application/json');
 try{const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/markets'){const q=marketQuery.safeParse(Object.fromEntries(url.searchParams));if(!q.success){res.statusCode=400;res.end(JSON.stringify({error:q.error.message}));return;}res.end(JSON.stringify(await getMarkets(q.data)));}
 else if(url.pathname==='/api/systems'){const q=url.searchParams.get('q')??'';if(q.length<2||q.length>100){res.statusCode=400;res.end(JSON.stringify({error:'Enter 2–100 characters.'}));return;}res.end(JSON.stringify(await searchSystems(q)));}
 else {res.statusCode=404;res.end(JSON.stringify({error:'Not found'}));}
 }catch(error){res.statusCode=502;res.end(JSON.stringify({error:error instanceof Error?error.message:'Market provider unavailable.'}));}
 });}}]});

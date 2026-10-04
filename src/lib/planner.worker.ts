import { planRoutes } from './planner';
self.onmessage=(e)=>{try{const {snapshot,ship,settings}=e.data;const result=planRoutes(snapshot,ship,settings,p=>self.postMessage({type:'progress',progress:p}));self.postMessage({type:'result',result});}catch(error){self.postMessage({type:'error',error:error instanceof Error?error.message:'Planning failed.'});}};

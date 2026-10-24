import {session,securityHeaders} from '../../server/session.mjs';
import {getUserStore} from '../../server/users.mjs';
import studioHtml from '../../server/studio-html.mjs';
export function createStudio(storeProvider=getUserStore){return async function studio(request){if(request.method!=='GET')return new Response(null,{status:405,headers:{...securityHeaders,Allow:'GET'}});try{if(!await session(request,storeProvider()))return new Response(null,{status:302,headers:{...securityHeaders,Location:'/login'}});return new Response(studioHtml,{headers:{...securityHeaders,'Content-Type':'text/html; charset=utf-8'}});}catch{return new Response('账号服务暂时不可用，请稍后重试。',{status:503,headers:securityHeaders});}};}
export default createStudio();
export const config={path:'/studio'};

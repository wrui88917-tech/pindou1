import {session,securityHeaders} from '../../server/session.mjs';
import {getUserStore} from '../../server/users.mjs';
import adminHtml from '../../server/admin-html.mjs';
export function createAdmin(storeProvider=getUserStore){return async function admin(request){if(request.method!=='GET')return new Response(null,{status:405,headers:{...securityHeaders,Allow:'GET'}});try{const user=await session(request,storeProvider());if(!user)return new Response(null,{status:302,headers:{...securityHeaders,Location:'/login'}});if(user.role!=='admin')return new Response('只有管理员可以访问账号管理。',{status:403,headers:securityHeaders});return new Response(adminHtml,{headers:{...securityHeaders,'Content-Type':'text/html; charset=utf-8'}});}catch{return new Response('账号服务暂时不可用，请稍后重试。',{status:503,headers:securityHeaders});}};}
export default createAdmin();
export const config={path:'/admin'};

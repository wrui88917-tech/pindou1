import {createHash} from 'node:crypto';
import {credentials,same,issue,session,decodeSession,sessionCookie,clearCookie,json,sameOrigin} from '../../server/session.mjs';
import {getUserStore,normalize,validUsername,validPassword,verifyPassword,account} from '../../server/users.mjs';
// Conditional writes keep the attempt budget consistent across function instances.
async function reserveAttempt(store,ip){const key='attempts/'+createHash('sha256').update(ip).digest('hex');for(let retry=0;retry<5;retry++){const old=await store.getWithMetadata(key,{type:'json'});const current=old?.data&&old.data.until>Date.now()?old.data:{count:0,until:Date.now()+15*60*1000};if(current.count>=10)return false;const result=await store.setJSON(key,{count:current.count+1,until:current.until},old?{onlyIfMatch:old.etag}:{onlyIfNew:true});if(result.modified)return true;}return false;}
export function createAuth(storeProvider=getUserStore){return async function auth(request,context={}){const path=new URL(request.url).pathname;
 if(path!=='/api/session'&&path!=='/api/login'&&path!=='/api/logout')return json(404,{error:'页面不存在。'});
 const allowed=path==='/api/session'?'GET':'POST';if(request.method!==allowed)return json(405,{error:'不支持此操作。'},{Allow:allowed});
 if(allowed==='POST'&&!sameOrigin(request))return json(403,{error:'请求来源不正确，请从本站操作。'});
 const settings=credentials();if(!settings)return json(503,{error:'管理员尚未完成账号配置，请联系网站管理员。'});
 try{const store=storeProvider();
 if(path==='/api/session'){const user=await session(request,store);return user?json(200,{user}):json(401,{error:'请先登录。'});}
 if(path==='/api/logout'){const token=decodeSession(request);if(token)await store.delete('sessions/'+token.nonce);return json(200,{ok:true},{'Set-Cookie':clearCookie()});}
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'请求格式不正确。'});
 let input;try{const text=await request.text();if(text.length>2048)return json(413,{error:'输入内容过长。'});input=JSON.parse(text);}catch{return json(400,{error:'请求格式不正确。'});}
 if(!input||typeof input.username!=='string'||typeof input.password!=='string'||input.username.length>64||input.password.length>128)return json(400,{error:'请输入有效的账号和密码。'});
 if(!await reserveAttempt(store,context.ip||request.headers.get('x-nf-client-connection-ip')||'unknown'))return json(429,{error:'尝试次数过多，请 15 分钟后再试。'},{'Retry-After':'900'});
 const username=normalize(input.username),user=await account(store,username,settings);
 const passwordOK=user?.role==='admin'?same(input.password,settings.password):await verifyPassword(input.password,user);
 if(!user||user.disabled||!passwordOK)return json(401,{error:'账号或密码不正确。'});
 const {token,payload}=issue(settings,user);await store.setJSON('sessions/'+payload.nonce,{username:user.username,expiresAt:payload.exp*1000});
 return json(200,{ok:true,user:{username:user.username,role:user.role},redirect:user.role==='admin'?'/admin':'/studio'},{'Set-Cookie':sessionCookie(token)});
 }catch{return json(503,{error:'账号服务暂时不可用，请稍后重试或联系管理员。'});}
};}
export default createAuth();
export const config={path:['/api/login','/api/session','/api/logout']};

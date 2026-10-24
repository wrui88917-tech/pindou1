import {randomBytes} from 'node:crypto';
import {session,credentials,json,sameOrigin} from '../../server/session.mjs';
import {getUserStore,normalize,validUsername,validPassword,hashPassword,userKey,publicUser} from '../../server/users.mjs';
export function createUsers(storeProvider=getUserStore){return async function users(request){if(!['GET','POST','PATCH'].includes(request.method))return json(405,{error:'不支持此操作。'},{Allow:'GET, POST, PATCH'});if(request.method!=='GET'&&!sameOrigin(request))return json(403,{error:'请求来源不正确。'});try{const store=storeProvider(),admin=await session(request,store);if(!admin)return json(401,{error:'请先登录。'});if(admin.role!=='admin')return json(403,{error:'只有管理员可以管理账号。'});
 if(request.method==='GET'){const users=[];for await(const page of store.list({prefix:'users/',paginate:true})){const records=await Promise.all(page.blobs.map(b=>store.get(b.key,{type:'json'})));for(const record of records)if(record)users.push(publicUser(record));}users.sort((a,b)=>a.username.localeCompare(b.username));return json(200,{users});}
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'请求格式不正确。'});
 let data;try{const text=await request.text();if(text.length>2048)return json(413,{error:'输入内容过长。'});data=JSON.parse(text);}catch{return json(400,{error:'请求格式不正确。'});}
 if(!data||typeof data!=='object')return json(400,{error:'请求格式不正确。'});const username=normalize(data.username);if(!validUsername(username))return json(400,{error:'账号须为 3–32 位英文字母、数字、点、横线或下划线。'});if(username===credentials().username)return json(400,{error:'管理员账号请在 Netlify 环境变量中修改。'});
 const key=userKey(username),existing=await store.getWithMetadata(key,{type:'json'}),now=new Date().toISOString();
 if(request.method==='POST'){if(existing)return json(409,{error:'账号已存在。'});if(!validPassword(data.password))return json(400,{error:'密码须为 12–128 个字符。'});const record={username,...await hashPassword(data.password),disabled:false,version:randomBytes(24).toString('hex'),createdAt:now,updatedAt:now};const result=await store.setJSON(key,record,{onlyIfNew:true});return result.modified?json(201,{user:publicUser(record)}):json(409,{error:'账号已存在。'});}
 if(!existing)return json(404,{error:'未找到该账号。'});const record={...existing.data,updatedAt:now,version:randomBytes(24).toString('hex')};if(data.password!==undefined){if(!validPassword(data.password))return json(400,{error:'新密码须为 12–128 个字符。'});Object.assign(record,await hashPassword(data.password));}else if(typeof data.disabled!=='boolean')return json(400,{error:'请选择停用、启用或重置密码。'});if(typeof data.disabled==='boolean')record.disabled=data.disabled;
 const result=await store.setJSON(key,record,{onlyIfMatch:existing.etag});return result.modified?json(200,{user:publicUser(record)}):json(409,{error:'该账号刚被修改，请刷新后重试。'});
 }catch{return json(503,{error:'账号存储暂时不可用，请稍后重试。'});}};}
export default createUsers();
export const config={path:'/api/users'};

import {createHmac,createHash,timingSafeEqual,randomBytes} from 'node:crypto';
import {normalize,validUsername,validPassword,account} from './users.mjs';
export const COOKIE='__Host-bead_session';
const HOURS=8*60*60;
export function credentials(){const username=normalize(process.env.ADMIN_USERNAME||'admin'),password=process.env.ADMIN_PASSWORD,secret=process.env.SESSION_SECRET;if(!validUsername(username)||!validPassword(password)||!secret||secret.length<32)return null;return {username,password,secret};}
function digest(value){return createHash('sha256').update(value).digest();}
export function same(a,b){return typeof a==='string'&&typeof b==='string'&&timingSafeEqual(digest(a),digest(b));}
function signature(body,secret){return createHmac('sha256',secret).update(body).digest('base64url');}
export function issue(c,user,now=Date.now()){const payload={username:user.username,exp:Math.floor(now/1000)+HOURS,v:user.version,nonce:randomBytes(24).toString('base64url')};const body=Buffer.from(JSON.stringify(payload)).toString('base64url');return {token:body+'.'+signature(body,c.secret),payload};}
export function decodeSession(request,now=Date.now()){const c=credentials();if(!c)return null;const cookie=request.headers.get('cookie')||'';const token=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||token.length>2048)return null;const parts=token.split('.');if(parts.length!==2||!same(parts[1],signature(parts[0],c.secret)))return null;try{const p=JSON.parse(Buffer.from(parts[0],'base64url').toString());if(!validUsername(p.username)||!Number.isSafeInteger(p.exp)||p.exp<=Math.floor(now/1000)||p.exp>Math.floor(now/1000)+HOURS||typeof p.nonce!=='string'||!/^[A-Za-z0-9_-]{32}$/.test(p.nonce)||typeof p.v!=='string')return null;return p;}catch{return null;}}
export async function session(request,store,now=Date.now()){const payload=decodeSession(request,now);if(!payload)return null;const active=await store.get('sessions/'+payload.nonce,{type:'json'});if(!active||active.expiresAt<=now||active.username!==payload.username)return null;const user=await account(store,payload.username,credentials());if(!user||user.disabled||!same(payload.v,user.version))return null;return {username:user.username,role:user.role};}
export function sessionCookie(token){return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${HOURS}`;}
export function clearCookie(){return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;}
export const securityHeaders={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'SAMEORIGIN'};
export function json(status,data,headers={}){return new Response(JSON.stringify(data),{status,headers:{...securityHeaders,'Content-Type':'application/json; charset=utf-8',...headers}});}
export function sameOrigin(request){return request.headers.get('origin')===new URL(request.url).origin;}

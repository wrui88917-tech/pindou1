import {getStore} from '@netlify/blobs';
import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export const getUserStore=()=>getStore({name:'bead-accounts',consistency:'strong'});
export const normalize=value=>typeof value==='string'?value.trim().toLowerCase():'';
export const validUsername=value=>/^[a-z0-9][a-z0-9_.-]{2,31}$/.test(value);
export const validPassword=value=>typeof value==='string'&&value.length>=12&&value.length<=128;
export const userKey=name=>'users/'+createHash('sha256').update(normalize(name)).digest('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const hash=await scrypt(password,salt,64);return {salt,hash:hash.toString('hex')};}
export async function verifyPassword(password,record){const hash=await scrypt(password,record?.salt||'unknown-account-timing-salt',64);const expected=record?.hash?Buffer.from(record.hash,'hex'):Buffer.alloc(64);return expected.length===hash.length&&timingSafeEqual(hash,expected);}
export async function account(store,username,settings){if(username===settings.username)return {username,role:'admin',disabled:false,version:createHash('sha256').update(settings.username+'\0'+settings.password).digest('hex')};const record=await store.get(userKey(username),{type:'json'});return record?{...record,role:'user'}:null;}
export function publicUser(record){return {username:record.username,disabled:!!record.disabled,createdAt:record.createdAt,updatedAt:record.updatedAt};}

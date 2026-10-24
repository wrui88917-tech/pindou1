// Local development adapter. Production uses site-scoped Netlify Blobs.
import {mkdir,readFile,writeFile,rename,readdir,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
export class LocalStore {
 constructor(directory){this.directory=resolve(directory);this.pending=new Map();}
 path(key){return resolve(this.directory,Buffer.from(key).toString('hex')+'.json');}
 async getWithMetadata(key){try{const text=await readFile(this.path(key),'utf8');return {data:JSON.parse(text),etag:createHash('sha256').update(text).digest('hex')};}catch(error){if(error.code==='ENOENT')return null;throw error;}}
 async get(key){return (await this.getWithMetadata(key))?.data??null;}
 async setJSON(key,data,options={}){const previous=this.pending.get(key)||Promise.resolve();const operation=previous.catch(()=>{}).then(async()=>{const current=await this.getWithMetadata(key);if(options.onlyIfNew&&current||options.onlyIfMatch&&current?.etag!==options.onlyIfMatch)return {modified:false};await mkdir(this.directory,{recursive:true});const text=JSON.stringify(data),path=this.path(key),temp=path+'.'+randomBytes(8).toString('hex');await writeFile(temp,text,{mode:0o600});await rename(temp,path);return {modified:true,etag:createHash('sha256').update(text).digest('hex')};});this.pending.set(key,operation);try{return await operation;}finally{if(this.pending.get(key)===operation)this.pending.delete(key);}}
 async delete(key){try{await unlink(this.path(key));}catch(error){if(error.code!=='ENOENT')throw error;}}
 async *list({prefix=''}){let files;try{files=await readdir(this.directory);}catch(error){if(error.code==='ENOENT'){yield {blobs:[]};return;}throw error;}yield {blobs:files.filter(f=>f.endsWith('.json')).map(f=>({key:Buffer.from(f.slice(0,-5),'hex').toString()})).filter(b=>b.key.startsWith(prefix))};}
}

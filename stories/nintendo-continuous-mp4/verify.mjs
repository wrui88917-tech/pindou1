import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname,resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'))}catch{({chromium}=require(process.env.PLAYWRIGHT_MODULE||'/workspace/.pindou-tools/node_modules/playwright'))}
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const p=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!p.startsWith(root+'/'))throw Error('Invalid path');res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':'text/html');res.end(await readFile(p))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.HYPERFRAMES_BROWSER_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const p=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],remote=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))remote.push(r.url())});
 await p.goto(`http://127.0.0.1:${server.address().port}/?export`);await p.evaluate(()=>document.fonts.ready);
 const fingerprint=async t=>{const data=await p.evaluate(t=>{renderFrame(t);return document.querySelector('canvas').toDataURL()},t);return createHash('sha256').update(data).digest('hex')};
 for(const t of [0,5,21,35,51,69.5,71.45,85.5,98,105,114,120]){const a=await fingerprint(t);await fingerprint(42);assert.equal(await fingerprint(t),a,`renderFrame(${t}) must be independent of call order`)}
 assert.deepEqual(await p.evaluate(()=>validateModel()),{particles:6000,targets:16,externalImages:0,externalFonts:0});
 // Browser interaction exercises the actual self-contained preview player.
 await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('#play').click();await p.waitForTimeout(120);await p.locator('#play').click();assert.ok(await p.evaluate(()=>lastFrame.t)>0);
 await p.locator('#seek').evaluate(input=>{input.value='73';input.dispatchEvent(new Event('input',{bubbles:true}))});assert.ok(Math.abs(await p.evaluate(()=>lastFrame.t)-73)<1/30);
 assert.ok((await p.locator('#clock').textContent()).startsWith('1:'));
 assert.equal(await p.locator('#sound').textContent(),'声音：关');
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 console.log(JSON.stringify({deterministicTimestamps:12,particleCount:6000,externalRequests:0,pageErrors:0,playPause:true,seek:true,defaultMuted:true},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r))}

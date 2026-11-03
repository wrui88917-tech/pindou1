import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root=dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
let chromium;
try { ({chromium}=require('playwright')); }
catch { ({chromium}=require(process.env.PLAYWRIGHT_MODULE || '/workspace/.pindou-tools/node_modules/playwright')); }
const args=process.argv.slice(2),has=s=>args.includes(s);
const output=resolve(process.env.OUTPUT || join(root,'nintendo-continuous-120s-1080p.mp4'));
const workerCount=Number(process.env.WORKERS || 3),total=120,fps=30,count=total*fps;
const dir=join(root,'frames');await mkdir(dir,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+'/')){res.writeHead(403).end();return}const data=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.wav':'audio/wav'})[extname(file)]||'application/octet-stream');res.end(data)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/?export`;
const browser=await chromium.launch({executablePath:process.env.HYPERFRAMES_BROWSER_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none']});
const failures=[],reports=[];let done=0;
try {
 const audioPage=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 await audioPage.goto(url);await audioPage.evaluate(()=>document.fonts.ready);console.log('Model:',await audioPage.evaluate(()=>validateModel()));
 // Font-ready initialization ensures sampled shop-sign glyphs use the local CJK face.
 if(!has('--frames-only')&&!has('--inspect')){
  await audioPage.exposeFunction('saveAudio',async data=>writeFile(join(root,'audio.wav'),Buffer.from(data,'base64')));
  await audioPage.evaluate(async()=>{const bytes=await soundtrackWav();let s='';for(let k=0;k<bytes.length;k+=32768)s+=String.fromCharCode(...bytes.slice(k,k+32768));await window.saveAudio(btoa(s))});
  console.log('OfflineAudioContext: 120-second stereo WAV saved');
 }
 if(has('--inspect')){
  for(const t of [0,6,12,21,26,35,43,51,66,69.5,71.45,76,85,91,98,105,114,119.97]){await audioPage.evaluate(t=>renderFrame(t),t);await audioPage.locator('#film').screenshot({path:join(dir,`sample-${String(t).replace('.','-')}.png`)});console.log('Sample',t)}
 }else{
  await audioPage.close();
  async function worker(id){const start=Math.floor(id*count/workerCount),end=Math.floor((id+1)*count/workerCount),page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});page.on('pageerror',e=>failures.push(String(e)));await page.goto(url);await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>{window.auditCanvas=document.createElement('canvas');auditCanvas.width=96;auditCanvas.height=54;window.auditContext=auditCanvas.getContext('2d',{willReadFrequently:true})});
   const stats=[];for(let i=start;i<end;i++){
    const stat=await page.evaluate(({i,fps})=>{const model=renderFrame(i/fps);if(model.particleCount!==6000)throw Error('Particle count');for(const text of model.visibleText)if(!TEXT_WHITELIST.includes(text))throw Error('Unexpected text');auditContext.drawImage(document.querySelector('#film'),0,0,96,54);const p=auditContext.getImageData(0,0,96,54).data,gray=[];let sum=0,black=0,white=0;for(let k=0;k<p.length;k+=4){const v=(p[k]+p[k+1]+p[k+2])/3;gray.push(v);sum+=v;if(v<6)black++;if(v>248)white++}return{frame:i,mean:sum/gray.length,black:black/gray.length,white:white/gray.length,gray}}, {i,fps});
    stats.push(stat);if(stat.black>.99||stat.white>.99)throw Error('Black/white frame '+i);
    const name=join(dir,`${String(i).padStart(5,'0')}.png`);
    let cached=false;if(has('--resume')){try{await access(name);cached=true}catch{}}
    if(!cached){const png=await page.evaluate(()=>document.querySelector('#film').toDataURL('image/png').split(',')[1]);await writeFile(name,Buffer.from(png,'base64'))}
    done++;if(done%120===0)console.log(`Frames ${done}/${count}`);
   }
   await page.evaluate(()=>renderFrame(120));reports.push(...stats);await page.close();
  }
  await Promise.all(Array.from({length:workerCount},(_,i)=>worker(i)));
  reports.sort((a,b)=>a.frame-b.frame);let maxChange=0,maxFrame=0;for(let i=1;i<reports.length;i++){const a=reports[i-1].gray,b=reports[i].gray;let d=0;for(let j=0;j<a.length;j++)d+=Math.abs(a[j]-b[j]);d/=a.length*255;if(d>maxChange){maxChange=d;maxFrame=reports[i].frame}}
  if(failures.length||maxChange>.18)throw Error(JSON.stringify({failures,maxChange,maxFrame}));
  const report={frames:reports.length,endpoint120:true,particles:6000,whitelist:true,runtimeErrors:failures,blackFrames:reports.filter(s=>s.black>.99).length,whiteFrames:reports.filter(s=>s.white>.99).length,maxAdjacentMeanAbsoluteDifference:maxChange,maxDifferenceFrame:maxFrame,meanLuminanceRange:[Math.min(...reports.map(s=>s.mean)),Math.max(...reports.map(s=>s.mean))]};
  await writeFile(join(root,'validation.json'),JSON.stringify(report,null,2));console.log('Validation:',report);
 }
}finally{await browser.close();await new Promise(r=>server.close(r))}
if(!has('--inspect')&&!has('--frames-only')){
 const command=['-y','-framerate',String(fps),'-i',join(dir,'%05d.png'),'-i',join(root,'audio.wav'),'-c:v','libx264','-threads','3','-preset','medium','-pix_fmt','yuv420p','-crf','16','-af','loudnorm=I=-20:TP=-1.5:LRA=11','-ar','48000','-c:a','aac','-b:a','192k','-t','120','-movflags','+faststart',output];
 await new Promise((resolve,reject)=>{const p=spawn('ffmpeg',command,{stdio:'inherit'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error('ffmpeg exit '+code)))});console.log('MP4:',output);
}

const path=require('path');
const {chromium}=require('playwright-core');
const fs=require('fs');
const {spawn}=require('child_process');
(async()=>{
 const browser=await chromium.launch({executablePath:(process.env.CHROME_PATH || '/usr/bin/chromium'),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1080,height:1920}});
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0});
 await page.setContent(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'));
 await page.evaluate(()=>document.fonts.ready);
 const wav=await page.evaluate(async()=>{
 const sr=48000,off=new OfflineAudioContext(1,sr*36,sr);
 function note(f,d,v,type='triangle',at=0){const o=off.createOscillator(),g=off.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,at);g.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(g);g.connect(off.destination);o.start(at);o.stop(at+d)}
 for(let s=0;s<144;s++){let at=s/4,chord=Math.floor(at/2)%4,pent=[262,294,330,392,440,523,587],seq=[0,2,4,5,4,2,3,1];note(pent[(seq[s%8]+chord)%7]*(s%16>=8?2:1),.18,.07,'triangle',at);if(s%4===0)note([131,147,110,98][chord],.5,.12,'sine',at);if(s%2===1)note(1800,.03,.012,'square',at)}
 for(const at of [3,9,15,21,26,32]){note(784,.25,.1,'square',at);note(1047,.3,.08,'square',at+.1)}
 const data=(await off.startRendering()).getChannelData(0),buf=new ArrayBuffer(44+data.length*2),v=new DataView(buf);const str=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,36+data.length*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,data.length*2,true);for(let i=0;i<data.length;i++)v.setInt16(44+i*2,Math.max(-1,Math.min(1,data[i]))*32767,true);
 let binary='';const bytes=new Uint8Array(buf);for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary);
 });fs.writeFileSync(path.join(__dirname,'audio.wav'),Buffer.from(wav,'base64'));
 const enc=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-r','30','-i','pipe:0','-i',path.join(__dirname,'audio.wav'),'-c:v','libx264','-preset','fast','-crf','18','-vf','scale=in_range=full:out_range=tv,format=yuv420p','-profile:v','main','-level','4.1','-color_range','tv','-af','afade=t=in:d=0.3,afade=t=out:st=34:d=2','-c:a','aac','-b:a','192k','-t','36','-movflags','+faststart',(process.argv[2] || path.join(__dirname,'xingli-rental-motion-36s.mp4'))]);enc.stderr.on('data',d=>process.stderr.write(d));
 const done=new Promise((res,rej)=>enc.on('close',c=>c===0?res():rej(Error('ffmpeg '+c))));
 for(let i=0;i<1080;i++){
 const frame=await page.evaluate(sec=>{t=sec;playing=true;draw();return cv.toDataURL('image/jpeg',.96).split(',')[1]},i/30);
 if(!enc.stdin.write(Buffer.from(frame,'base64')))await new Promise(r=>enc.stdin.once('drain',r));
 if(i%150===0)console.log('Rendered '+i+'/1080');
 if([60,180,360,540,720,870,1020].includes(i))fs.writeFileSync(path.join(__dirname,'frame-'+i+'.jpg'),Buffer.from(frame,'base64'));
 }enc.stdin.end();await done;await browser.close();console.log('DONE');
})().catch(e=>{console.error(e);process.exit(1)});

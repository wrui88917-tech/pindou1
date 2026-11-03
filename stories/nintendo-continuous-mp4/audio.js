'use strict';
// All event times are film seconds; OfflineAudioContext makes export repeatable.
window.makeSoundtrack=async function(){
 const sr=48000,ac=new OfflineAudioContext(2,sr*120,sr),master=ac.createGain();master.gain.value=.64;
 const compressor=ac.createDynamicsCompressor();compressor.threshold.value=-16;compressor.knee.value=12;compressor.ratio.value=3;master.connect(compressor);compressor.connect(ac.destination);
 let state=1889;const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296};
 function tone(t,d,f,vol=.1,type='sine',pan=0){const o=ac.createOscillator(),a=ac.createGain(),p=ac.createStereoPanner();o.type=type;o.frequency.setValueAtTime(f,t);p.pan.value=pan;a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(vol,t+Math.min(.04,d*.2));a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(p);p.connect(master);o.start(t);o.stop(t+d+.01)}
 function noise(t,d,hz,vol,pan=0){const b=ac.createBuffer(1,Math.ceil(sr*d),sr),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(random()*2-1)*Math.sin(Math.PI*i/data.length);const n=ac.createBufferSource(),f=ac.createBiquadFilter(),a=ac.createGain(),p=ac.createStereoPanner();n.buffer=b;f.type='bandpass';f.frequency.value=hz;f.Q.value=.7;a.gain.value=vol;p.pan.value=pan;n.connect(f);f.connect(a);a.connect(p);p.connect(master);n.start(t)}
 // Warm, restrained pentatonic score. Sparse first half, a gentle pulse after 46s.
 const roots=[130.8128,110,146.8324,97.9989];
 for(let bar=0;bar<20;bar++){const t=bar*6,root=roots[Math.floor(bar/2)%roots.length];for(const [j,ratio] of [1,1.5,2].entries())tone(t,Math.min(8,120-t),root*ratio,.038,'sine',(j-1)*.45);const notes=[2,2.5,3,4,3,2.5];for(let k=0;k<(t<46?3:6);k++){const when=t+k*(t<46?1.75:.9);if(when<118)tone(when,2.8,root*notes[(k+bar)%notes.length],t<46?.042:.047,'sine',Math.sin(k)*.4)}}
 for(let t=47;t<108;t+=.75){tone(t,.19,65.406,.055,'sine');if(t>62)noise(t+.375,.055,3600,.025,.2)}
 // Procedural foley: paper, brush, wood bell, metallic wind, mechanical toy.
 noise(0,2.8,750,.16,-.4);noise(8,3,390,.1,-.5);
 for(const t of [10,12.4]){tone(t,1.8,523.25,.07,'sine',-.4);tone(t,.9,1080,.025,'sine',-.4)}
 for(const t of [14.2,16.3,19.8,22.2,24.5,26])noise(t,.7,1300,.11,-.3);
 noise(28,5,520,.13,.5);tone(38,3.5,392,.055,'sine',.4);
 for(const t of [62,65,68,71.3,73,76]){noise(t,.18,1100,.08);tone(t,.3,196,.045,'triangle')}
 for(const [t,base] of [[80,261.626],[86,329.628],[93,392],[100,523.251]]){[1,1.25,1.5,2].forEach((r,i)=>tone(t+i*.12,.45,base*r,.045,'triangle',.2));noise(t,1,2100,.06,.25)}
 noise(108,2.5,820,.08);tone(116,3.8,261.626,.09);tone(117,2.8,392,.045);
 const fade=ac.createGain(); // Final master taper without changing video or adding a black frame.
 master.disconnect();master.connect(fade);fade.connect(compressor);fade.gain.setValueAtTime(0,0);fade.gain.linearRampToValueAtTime(1,2);fade.gain.setValueAtTime(1,111);fade.gain.linearRampToValueAtTime(0,120);
 return ac.startRendering();
};
window.soundtrackWav=async()=>{const audio=await makeSoundtrack(),length=audio.length,channels=audio.numberOfChannels,bytes=new ArrayBuffer(44+length*channels*2),v=new DataView(bytes);const str=(p,s)=>[...s].forEach((x,i)=>v.setUint8(p+i,x.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+length*channels*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,audio.sampleRate,true);v.setUint32(28,audio.sampleRate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,length*channels*2,true);const data=Array.from({length:channels},(_,i)=>audio.getChannelData(i));for(let i=0;i<length;i++)for(let j=0;j<channels;j++)v.setInt16(44+(i*channels+j)*2,Math.max(-1,Math.min(1,data[j][i]))*32767,true);return Array.from(new Uint8Array(bytes))};

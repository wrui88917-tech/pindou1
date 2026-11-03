'use strict';
if(new URLSearchParams(location.search).has('export'))document.body.classList.add('export');
else {
 const play=document.querySelector('#play'),sound=document.querySelector('#sound'),seek=document.querySelector('#seek'),clock=document.querySelector('#clock');
 let playing=false,t=0,origin=0,audioContext,audioBuffer,audioSource,soundOn=false;
 const stopAudio=()=>{if(audioSource){audioSource.stop();audioSource=null}};
 const syncAudio=()=>{stopAudio();if(playing&&soundOn&&audioBuffer){audioSource=audioContext.createBufferSource();audioSource.buffer=audioBuffer;audioSource.connect(audioContext.destination);audioSource.start(0,t)}};
 function show(){renderFrame(t);seek.value=t;clock.textContent=`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')} / 2:00`}
 play.onclick=()=>{if(t>=TOTAL)t=0;playing=!playing;origin=performance.now()-t*1000;play.textContent=playing?'暂停':'播放';syncAudio()};
 seek.oninput=()=>{t=Number(seek.value);origin=performance.now()-t*1000;show();syncAudio()};
 sound.onclick=async()=>{if(!audioContext){audioContext=new AudioContext();await audioContext.resume();audioBuffer=await makeSoundtrack()}soundOn=!soundOn;sound.textContent=soundOn?'声音：开':'声音：关';syncAudio()};
 function tick(now){if(playing){t=Math.min(TOTAL,(now-origin)/1000);show();if(t>=TOTAL){playing=false;play.textContent='播放';stopAudio()}}requestAnimationFrame(tick)}
 requestAnimationFrame(tick);show();
}

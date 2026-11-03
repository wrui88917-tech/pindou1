'use strict';
(() => {
 const $=id=>document.getElementById(id),canvas=$('wallpaper');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
 const showError=message=>{$('error').textContent=message;$('error').hidden=false;};
 if(!gl){showError('当前浏览器不支持所需的图形加速，请换用新版 Chrome。');return;}
 const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=vec2((position.x+1.0)*.5,(1.0-position.y)*.5);gl_Position=vec4(position,0.0,1.0);}`;
 const fragment=`precision highp float;
 varying vec2 uv;uniform sampler2D photo;uniform vec2 resolution;uniform vec2 imageSize;uniform vec3 pose;uniform float strength;uniform float seconds;uniform float rain;uniform float glow;uniform float preset;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float volume(vec2 p,vec2 center,vec2 radius,float angle){vec2 q=p-center;float a=cos(angle),b=sin(angle);q=mat2(a,-b,b,a)*q/radius;float r=length(q);return 1.0-smoothstep(.72,1.10,r);}
 float depth(vec2 p){float body=0.0;
  if(preset<.5){body=max(volume(p,vec2(.66,.50),vec2(.335,.155),-.22),volume(p,vec2(.285,.385),vec2(.21,.25),-.18));body=max(body,volume(p,vec2(.12,.205),vec2(.115,.15),-.37)*.8);body=max(body,volume(p,vec2(.69,.70),vec2(.10,.16),-.65));body=max(body,volume(p,vec2(.85,.825),vec2(.08,.10),-.3));}
  else if(preset<1.5){body=volume(p,vec2(.5,.49),vec2(.31,.36),0.0);}
  float far=.16+.20*p.y;return preset>1.5?.45:mix(far,.94,body);
 }
 float streaks(vec2 p,float density,float speed,float opacity){p.x+=p.y*.27;p.y-=seconds*speed;vec2 cell=floor(p*density);vec2 q=fract(p*density);float r=hash(cell);q.x-=.14+r*.70;float line=exp(-abs(q.x)*95.0)*smoothstep(.08,.2,q.y)*(1.0-smoothstep(.34,.85,q.y));return line*step(.84,r)*opacity;}
 void main(){
  vec2 screen=resolution;float cover=max(screen.x/imageSize.x,screen.y/imageSize.y)*1.105;
  vec2 span=screen/(imageSize*cover),source=(uv-.5)*span+.5;
  vec2 v=uv-.5;float roll=pose.z*.012;float co=cos(roll),si=sin(roll);v=mat2(co,-si,si,co)*v;source=v*span+.5;
  vec2 shift=vec2(pose.x*.024,pose.y*.014)*strength;vec2 sampleUV=source;
  // Inverse depth warp, deliberately small to protect costume and facial detail.
  for(int i=0;i<5;i++){float d=depth(sampleUV);sampleUV=source-shift*(d-.36)*span;}
  vec3 color=texture2D(photo,clamp(sampleUV,.001,.999)).rgb;
  float hero=depth(sampleUV);vec2 aspectUV=vec2(uv.x*screen.x/screen.y,uv.y);
  float wet=streaks(aspectUV+pose.xy*.006,64.0,.30,.18)+streaks(aspectUV-pose.xy*.012,38.0,.43,.12);
  color+=vec3(.54,.71,.90)*wet*rain*(1.0-hero*.62);
  float shimmer=0.0;for(int i=0;i<5;i++){float n=float(i);vec2 center=vec2(fract(n*.381+.12),fract(n*.217+.06));center+=vec2(pose.x,pose.y)*(.005+n*.001);vec2 d=(uv-center)*vec2(screen.x/screen.y,1.0);shimmer+=exp(-dot(d,d)/(0.00018+n*.000025))*(.5+.5*sin(seconds*.5+n));}
  color+=vec3(.11,.065,.025)*shimmer*glow*(1.0-hero*.75);
  gl_FragColor=vec4(color,1.0);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){showError('图形初始化失败：'+e.message);return;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const locations={};for(const name of ['photo','resolution','imageSize','pose','strength','seconds','rain','glow','preset'])locations[name]=gl.getUniformLocation(program,name);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 const state={loaded:false,width:1,height:1,strength:.42,rain:true,glow:true,preset:0,battery:false,gyro:false,seen:false,frames:0};
 const target={x:0,y:0,z:0},current={x:0,y:0,z:0};let baseline=null,last=0,lastPaint=0,uiTimer,objectURL,drag=null;
 const clamp=(n,a=-1,b=1)=>Math.max(a,Math.min(b,n));
 function resize(w=innerWidth,h=innerHeight,dpr){dpr=dpr||Math.min(devicePixelRatio||1,state.battery?1.5:3,Math.sqrt(4800000/(w*h)));canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));gl.viewport(0,0,canvas.width,canvas.height);}
 function render(t){if(!state.loaded)return;gl.useProgram(program);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(locations.photo,0);gl.uniform2f(locations.resolution,canvas.width,canvas.height);gl.uniform2f(locations.imageSize,state.width,state.height);gl.uniform3f(locations.pose,current.x,current.y,current.z);gl.uniform1f(locations.strength,.20+state.strength*1.35);gl.uniform1f(locations.seconds,t);gl.uniform1f(locations.rain,state.rain?1:0);gl.uniform1f(locations.glow,state.glow?1:0);gl.uniform1f(locations.preset,state.preset);gl.drawArrays(gl.TRIANGLES,0,6);state.frames++;}
 function wakeUI(){document.body.classList.remove('quiet');clearTimeout(uiTimer);uiTimer=setTimeout(()=>{if($('panel').hidden&&state.loaded)document.body.classList.add('quiet');},5500);}
 async function loadImageURL(url){const image=new Image();image.decoding='async';await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('图片无法读取，请选择 JPG、PNG 或 WebP。'));image.src=url;});
  if(image.naturalWidth<200||image.naturalHeight<200)throw Error('图片太小，请选择高清原图。');
  const max=gl.getParameter(gl.MAX_TEXTURE_SIZE);let source=image;
  if(image.naturalWidth>max||image.naturalHeight>max){const temp=document.createElement('canvas'),s=Math.min(max/image.naturalWidth,max/image.naturalHeight);temp.width=Math.round(image.naturalWidth*s);temp.height=Math.round(image.naturalHeight*s);temp.getContext('2d').drawImage(image,0,0,temp.width,temp.height);source=temp;}
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);if(gl.getError()!==gl.NO_ERROR)throw Error('图片纹理载入失败，请尝试另一张图片。');state.width=source.width||source.naturalWidth;state.height=source.height||source.naturalHeight;state.loaded=true;$('empty').hidden=true;$('hud').hidden=false;$('error').hidden=true;current.x=current.y=current.z=target.x=target.y=target.z=0;baseline=null;resize();render(0);wakeUI();return{width:state.width,height:state.height};
 }
 async function chooseFile(file){if(!file)return;const previous=objectURL;objectURL=URL.createObjectURL(file);try{await loadImageURL(objectURL);if(previous)URL.revokeObjectURL(previous);}catch(e){URL.revokeObjectURL(objectURL);objectURL=previous;showError(e.message);}}
 $('file').addEventListener('change',e=>chooseFile(e.target.files[0]));$('chooseStart').onclick=$('choose').onclick=()=>{$('file').value='';$('file').click();};
 function calibration(){baseline=null;target.x=target.y=target.z=0;current.x=current.y=current.z=0;$('hint').textContent=state.gyro?'保持自然握姿，已重新归中':'已回到中心视角';wakeUI();}
 $('calibrate').onclick=calibration;
 const delta=(a,b)=>{let d=a-b;while(d>180)d-=360;while(d< -180)d+=360;return d;};
 function orientation(event){if(!state.gyro||event.gamma==null||event.beta==null)return;state.seen=true;let b=event.beta,g=event.gamma,a=event.alpha||0;if(!baseline)baseline={b,g,a};let x=clamp(delta(g,baseline.g)/25),y=clamp(delta(b,baseline.b)/28);const rotation=(screen.orientation&&screen.orientation.angle)||window.orientation||0;if(rotation===90){const t=x;x=-y;y=t;}else if(rotation===-90||rotation===270){const t=x;x=y;y=-t;}else if(Math.abs(rotation)===180){x=-x;y=-y;}target.x=x;target.y=y;target.z=clamp(delta(a,baseline.a)/40);$('hint').textContent='体感已开启 · 轻轻倾斜手机';}
 addEventListener('deviceorientation',orientation);
 $('motion').onclick=async()=>{wakeUI();if(state.gyro){state.gyro=false;$('motion').textContent='开启体感';calibration();return;}if(!isSecureContext){$('hint').textContent='体感需要 HTTPS 或支持本地文件的浏览器；当前可拖动预览。';return;}try{if(typeof DeviceOrientationEvent==='undefined')throw Error('浏览器没有提供体感接口');if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted')throw Error('体感权限未开启');state.gyro=true;state.seen=false;baseline=null;$('motion').textContent='关闭体感';setTimeout(()=>{if(state.gyro&&!state.seen){state.gyro=false;$('motion').textContent='开启体感';$('hint').textContent='尚未收到体感数据；可以先拖动预览。';}},2500);}catch(e){$('hint').textContent=e.message+'；可以先拖动预览。';}};
 function panel(open){$('panel').hidden=!open;$('settings').setAttribute('aria-expanded',String(open));wakeUI();}
 $('settings').onclick=()=>panel($('panel').hidden);$('close').onclick=()=>panel(false);
 $('strength').oninput=e=>{state.strength=Number(e.target.value)/100;$('strengthValue').textContent=state.strength<.3?'细微':state.strength<.65?'轻柔':'明显';};
 $('preset').onchange=e=>{state.preset={reference:0,center:1,flat:2}[e.target.value];};
 for(const name of ['rain','glow','battery'])$(name).onchange=e=>{state[name]=e.target.checked;if(name==='battery')resize();};
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){$('hint').textContent='此浏览器未开放全屏；可隐藏按钮观看。';}};
 $('export').onclick=async()=>{if(!state.loaded)return;const width=canvas.width,height=canvas.height;resize(1440,3120,1);render(last*.001);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));resize();render(last*.001);if(!blob){showError('当前浏览器未能导出，请尝试截图。');return;}const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='cinematic-wallpaper-1440x3120.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
 canvas.addEventListener('pointerdown',e=>{if(!state.loaded)return;drag={x:e.clientX,y:e.clientY,tx:target.x,ty:target.y};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!state.loaded||state.gyro||!drag)return;target.x=clamp(drag.tx+(e.clientX-drag.x)/innerWidth*2.2);target.y=clamp(drag.ty+(e.clientY-drag.y)/innerHeight*2.2);});
 function release(){drag=null;if(!state.gyro){target.x=target.y=target.z=0;}}
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('dblclick',()=>{document.body.classList.toggle('quiet');if(!document.body.classList.contains('quiet'))wakeUI();});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();showError('图形上下文被系统释放，请重新打开本页面。');});
 addEventListener('resize',()=>{resize();render(last*.001);});
 function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000||1/60);last=now;if(state.testingPaused||document.hidden||!state.loaded||now-lastPaint<(state.battery?50:1000/30))return;lastPaint=now;const a=1-Math.exp(-dt*8);for(const key of ['x','y','z'])current[key]+=(target[key]-current[key])*a;render(now*.001);}
 window.__wallpaper={state,loadImageURL,pause(value=true){state.testingPaused=value;},getPose(){return {...current};},setPose(x,y,z=0){current.x=target.x=clamp(x);current.y=target.y=clamp(y);current.z=target.z=clamp(z);},renderAt(t){render(t);},resize,calibration};
 resize();requestAnimationFrame(frame);
})();

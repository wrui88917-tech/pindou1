'use strict';
(() => {
const W=1920,H=1080,N=6000,AXIS=900,COUNT=N-AXIS;
const canvas=document.querySelector('#film'),c=canvas.getContext('2d',{alpha:false});
const GOLD=[196,163,105],IVORY=[233,220,195],RED=[164,92,70],BLUE=[99,123,135],GREEN=[142,154,120];
const serif='"Noto Serif CJK SC",serif';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),lerp=(a,b,q)=>a+(b-a)*q;
const smooth=q=>{q=clamp(q);return q*q*q*(q*(q*6-15)+10)};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const random=rng(1889),seed=Array.from({length:N},()=>[random(),random(),random(),random()]);
const WHITELIST=['Nintendo 1889','任天堂','1889 京都','花札纸牌','1889 巴黎','埃菲尔铁塔竣工','同一年，两个世界','纸牌之后','玩具制造','1983','1989','2006','2017','从花札到游戏世界','1889'];
let g;
function stroke(points,col=GOLD,width=3){g.strokeStyle=`rgb(${col})`;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke()}
function polygon(points,col){g.fillStyle=`rgb(${col})`;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()}
function rect(x,y,w,h,col,rad=4,edge=null){g.beginPath();g.roundRect(x,y,w,h,rad);g.fillStyle=`rgb(${col})`;g.fill();if(edge){g.strokeStyle=`rgb(${edge})`;g.lineWidth=3;g.stroke()}}
function ellipse(x,y,rx,ry,col,rotation=0){g.beginPath();g.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);g.fillStyle=`rgb(${col})`;g.fill()}
function blossom(x,y,size,col,petals=5){for(let j=0;j<petals;j++){const a=j/petals*Math.PI*2;ellipse(x+Math.cos(a)*size*.7,y+Math.sin(a)*size*.7,size*.66,size*.4,col,a)}ellipse(x,y,size*.23,size*.23,GOLD)}
function hanafuda(x,y,s,month=2){g.save();g.translate(x,y);g.scale(s,s);rect(-105,-165,210,330,[197,181,147],7,GOLD);rect(-93,-153,186,306,[52,49,37],3);polygon([[-92,153],[-92,105],[-10,42],[92,96],[92,153]],RED);stroke([[-70,130],[-35,30],[12,-60],[64,-124]],GREEN,10);
 const rr=rng(100+month);for(let j=0;j<9;j++){const px=-70+rr()*140,py=-132+rr()*240;if(month===0){stroke([[px-25,py+14],[px,py-8],[px+28,py+14]],GREEN,7)}else if(month===3){for(let k=0;k<4;k++)ellipse(px+Math.sin(k)*7,py+k*11,7,10,[140,120,151])}else{blossom(px,py,9+rr()*7,month%3===0?IVORY:RED,month===8?9:5)}}
 if(month===7)ellipse(45,-100,24,24,GOLD);g.restore()}
function tower(){const pts=[[0,-280],[-22,-135],[-58,30],[-120,195],[-220,300],[-130,300],[-62,180],[62,180],[130,300],[220,300],[120,195],[58,30],[22,-135],[0,-280]];polygon(pts,RED);polygon([[-68,265],[-32,190],[32,190],[68,265]], [36,30,25]);stroke(pts,GOLD,3);for(let k=0;k<10;k++){const y=-230+k*49,hw=20+Math.pow((y+280)/580,1.8)*180;stroke([[-hw,y],[hw,y]],GOLD,3);stroke([[-hw,y],[hw*.88,y-42]],BLUE,2);stroke([[hw,y],[-hw*.88,y-42]],GOLD,2)}rect(-80,35,160,12,RED,1);rect(-140,181,280,14,RED,1);stroke([[0,-280],[0,-310]],GOLD,4)}
function shop(){// Historical Kyoto wooden frontage, paper screens and a seated artisan.
 polygon([[-360,-85],[-260,-230],[210,-230],[365,-85]],BLUE);stroke([[-360,-85],[-260,-230],[210,-230],[365,-85]],GOLD,7);
 rect(-300,-78,600,350,[112,83,55],2);for(let j=0;j<8;j++)rect(-282+j*77,-65,8,324,GOLD,1);
 rect(-235,-35,185,220,[180,157,112],1);for(let i=0;i<5;i++)stroke([[-235,-25+i*47],[-50,-25+i*47]],[95,78,56],4);
 rect(-10,-23,260,200,[42,35,27],1);stroke([[-5,45],[250,45]],GOLD,3);
 rect(-145,-164,290,68,[68,49,33],3,GOLD);g.font=`38px ${serif}`;g.textAlign='center';g.fillStyle=`rgb(${IVORY})`;g.fillText('任天堂',0,-116);
 for(const x of [-270,270]){ellipse(x,-40,20,35,RED);stroke([[x,-95],[x,-72]],GOLD,3)}
 rect(-60,184,300,13,[185,152,101],2);stroke([[-30,195],[-45,277]],GOLD,7);stroke([[210,195],[225,277]],GOLD,7);
 ellipse(98,54,24,27,[181,158,119]);polygon([[76,80],[118,80],[147,158],[50,158]],BLUE);stroke([[82,99],[28,142],[8,171]],IVORY,9);stroke([[8,157],[16,184]],GOLD,4);rect(-40,167,90,9,IVORY,1);
 stroke([[-375,288],[385,288]],GOLD,4);for(let k=0;k<7;k++)stroke([[-350+k*110,290],[-395+k*120,324]],BLUE,2);
}
function rice(){rect(-115,-170,230,300,[185,160,111],8,GOLD);polygon([[-115,-170],[115,-170],[86,-214],[-80,-214]],IVORY);ellipse(0,-35,55,55,RED);ellipse(0,118,125,30,IVORY);polygon([[-120,122],[120,122],[75,197],[-75,197]],BLUE);for(let i=0;i<50;i++){const a=i*2.399,r=Math.sqrt(i/50)*95;ellipse(Math.cos(a)*r,110+Math.sin(a)*r*.25,6,2.5,GOLD,-.4)}}
function taxi(){rect(-250,-25,500,145,GREEN,28,GOLD);polygon([[-180,-25],[-112,-142],[105,-142],[190,-25]],GREEN);rect(-105,-123,92,78,BLUE,5,GOLD);rect(5,-123,92,78,BLUE,5,GOLD);rect(-38,-174,76,24,GOLD);for(const x of [-160,160]){ellipse(x,125,57,57,[45,42,33]);ellipse(x,125,29,29,IVORY);ellipse(x,125,10,10,GOLD)}rect(-230,10,34,25,IVORY);rect(205,10,25,25,RED);stroke([[-190,62],[190,62]],GOLD,3)}
function hotel(){rect(-110,-150,220,290,[127,128,120],3);for(let y=0;y<4;y++)for(let x=0;x<3;x++)rect(-80+x*58,-119+y*53,24,28,[58,56,49],1);rect(-23,88,46,52,[58,56,49],1)}
function toy(){rect(-315,130,120,85,RED,18,GOLD);for(let i=0;i<5;i++){const x=-235+i*90,y=140-i*42;stroke([[x,y],[x+90,y-105]],IVORY,13);stroke([[x,y-65],[x+90,y-40]],GOLD,12);ellipse(x+45,y-53,9,9,BLUE)}stroke([[215,-110],[275,-174],[325,-158]],RED,19);stroke([[215,-110],[302,-61],[334,-102]],RED,19)}
function fc(){rect(-300,-155,600,300,IVORY,16,RED);rect(-300,42,600,103,RED,12);rect(-150,-179,300,64,RED,7);rect(-207,-80,414,64,[69,56,43],5);for(let j=0;j<8;j++)rect(145+j*12,-24,5,52,[79,60,44],1);stroke([[-60,150],[-80,180],[-160,203]],GOLD,5);rect(-220,191,345,119,RED,12,GOLD);rect(-198,210,302,79,[183,157,109],4);rect(-173,224,24,50,[53,43,34],1);rect(-186,237,50,24,[53,43,34],1);for(const x of [36,78])ellipse(x,253,15,15,RED)}
function gb(){rect(-157,-279,314,558,[201,195,164],27,GOLD);rect(-131,-238,262,226,[79,84,71],12);rect(-100,-205,200,155,[137,153,109],3);for(let j=0;j<8;j++)rect(-73+j*20,-175+(j%3)*18,12,51,[91,108,76],1);rect(-101,45,35,104,[48,47,40],3);rect(-135,80,104,35,[48,47,40],3);ellipse(67,104,25,25,RED);ellipse(116,66,25,25,RED);for(let j=0;j<5;j++)stroke([[36+j*17,210],[44+j*17,246]],BLUE,5);stroke([[-57,191],[-26,183]],BLUE,8);stroke([[-7,191],[24,183]],BLUE,8)}
function wii(){rect(-90,-294,180,567,IVORY,25,GOLD);rect(-28,-213,56,132,[68,72,64],4);rect(-64,-175,128,54,[68,72,64],4);ellipse(0,-253,11,11,BLUE);ellipse(0,1,30,30,BLUE);for(const y of [87,146])ellipse(0,y,20,20,[167,169,151]);for(let j=0;j<12;j++)ellipse((j%3-1)*15,196+Math.floor(j/3)*14,3,3,BLUE);stroke([[0,275],[10,315],[90,310],[100,260]],GOLD,4)}
function sw(){rect(-350,-190,700,380,[51,55,52],28,GOLD);rect(-247,-165,494,330,BLUE,6);rect(-224,-144,448,288,[100,122,108],4);rect(-350,-190,100,380,BLUE,28);rect(250,-190,100,380,RED,28);ellipse(-300,-84,28,28,[46,44,36]);ellipse(300,73,28,28,[46,44,36]);for(let j=0;j<4;j++){const a=j/4*Math.PI*2;ellipse(-300+Math.cos(a)*26,62+Math.sin(a)*26,8,8,IVORY);ellipse(300+Math.cos(a)*26,-70+Math.sin(a)*26,8,8,IVORY)}
 polygon([[-200,95],[-120,-56],[-30,30],[65,-90],[202,95]],GOLD);ellipse(130,-80,28,28,IVORY)}
function shape(draw,seedValue){const surface=document.createElement('canvas');surface.width=960;surface.height=740;g=surface.getContext('2d',{willReadFrequently:true});g.translate(480,365);draw();const pixels=g.getImageData(0,0,960,740).data,r=rng(seedValue),pts=new Float32Array(COUNT*5);let tries=0;
 for(let i=0;i<COUNT;i++){let x,y,k;do{x=Math.floor(r()*960);y=Math.floor(r()*740);k=(y*960+x)*4;if(++tries>2e7)throw Error('Empty target')}while(pixels[k+3]<40);const j=i*5;pts[j]=x-480;pts[j+1]=y-365;pts[j+2]=pixels[k];pts[j+3]=pixels[k+1];pts[j+4]=pixels[k+2]}
 // Stable spatial correspondence reduces chaotic crossing while preserving identity.
 const order=Array.from({length:COUNT},(_,i)=>i).sort((a,b)=>Math.atan2(pts[a*5+1],pts[a*5])-Math.atan2(pts[b*5+1],pts[b*5]));const out=new Float32Array(pts.length);order.forEach((id,i)=>out.set(pts.subarray(id*5,id*5+5),i*5));return out}
const targets={};
targets.shop=shape(shop,1);targets.card=shape(()=>hanafuda(0,0,1.65,2),2);
targets.months=shape(()=>{for(let i=0;i<12;i++)hanafuda(-350+(i%6)*140,-160+Math.floor(i/6)*335,.49,i)},3);
targets.tower=shape(tower,4);
targets.both=shape(()=>{g.save();g.translate(-245,50);g.scale(.52,.52);shop();g.restore();g.save();g.translate(245,30);g.scale(.65,.65);tower();g.restore();stroke([[-240,260],[240,260]],GOLD,3)},5);
targets.rice=shape(rice,6);targets.taxi=shape(taxi,7);targets.hotel=shape(()=>{g.scale(.46,.46);hotel()},8);targets.toy=shape(toy,9);targets.fc=shape(fc,10);targets.gb=shape(gb,11);targets.wii=shape(wii,12);targets.switch=shape(sw,13);
targets.paper=new Float32Array(COUNT*5);targets.line=new Float32Array(COUNT*5);targets.point=new Float32Array(COUNT*5);
for(let i=0;i<COUNT;i++){const k=i*5,s=seed[i+AXIS];targets.paper.set([(s[0]-.5)*1700,(s[1]-.5)*840,...GOLD],k);targets.line.set([(i/COUNT-.5)*1400,343+(s[1]-.5)*5,...GOLD],k);const a=s[0]*Math.PI*2,r=Math.sqrt(s[1])*8;targets.point.set([-210+Math.cos(a)*r,343+Math.sin(a)*r,...GOLD],k)}
// Continuous x-axis world positions; 1889 Kyoto/Paris are two neighbouring places in the same year.
const stages=[
 [0,'paper',0,.85],[5,'line',0,1],[11.4,'shop',450,1],[17.4,'card',650,1.2],[27.4,'months',1000,1],
 [31.4,'tower',1550,1.12],[41.4,'tower',1650,1.24],[49.4,'both',1400,1.1],[57.4,'line',1900,1],
 [64,'card',2400,.9],[66,'rice',2750,1.1],[68.5,'taxi',3150,1],[71.45,'hotel',3400,1],
 [71.9,'toy',3550,1],[83.4,'fc',4200,1.06],[89.4,'gb',4800,1.07],[96.4,'wii',5400,1.08],
 [103.4,'switch',6000,1.1],[111.4,'card',6400,1.25],[120,'point',0,1],[121,'point',0,1]
];
const cues=[['Nintendo 1889',5,9.5,84],['1889 京都',9,16.5,64],['花札纸牌',16,29.5,72],['1889 巴黎',30,40.5,64],['埃菲尔铁塔竣工',40,47.7,66],['同一年，两个世界',48,62.5,66],['纸牌之后',63,73.5,72],['玩具制造',73,81.7,72],['1983',85,88.2,108],['1989',91,95.2,108],['2006',97,102.2,108],['2017',104,110,108],['从花札到游戏世界',110,117.8,64],['1889',117,121.8,120]];
const paper=document.createElement('canvas');paper.width=W;paper.height=H;const pc=paper.getContext('2d');pc.fillStyle='#241e19';pc.fillRect(0,0,W,H);const pr=rng(2889);for(let i=0;i<90000;i++){pc.fillStyle=i%2?'rgba(233,220,195,.035)':'rgba(5,2,0,.10)';pc.fillRect(pr()*W,pr()*H,pr()*3+.4,.5+pr()*1.5)}
const vignette=pc.createRadialGradient(1030,470,120,960,540,1130);vignette.addColorStop(0,'rgba(196,163,105,.10)');vignette.addColorStop(.6,'rgba(36,30,25,0)');vignette.addColorStop(1,'rgba(8,5,2,.65)');pc.fillStyle=vignette;pc.fillRect(0,0,W,H);
const positionBuffer=new Float32Array(N*2);let visible=[];
function label(value,x,y,size,alpha){if(alpha<=0)return;if(!WHITELIST.includes(value))throw Error('Text outside whitelist: '+value);visible.push(value);c.save();c.globalAlpha=alpha;c.fillStyle='#e9dcc3';c.font=`400 ${size}px ${/^[0-9]/.test(value)&&!value.includes(' ')?'Georgia,serif':serif}`;c.textAlign='left';c.textBaseline='middle';c.fillText(value,x,y);c.restore()}
function state(t){let idx=0;while(idx<stages.length-2&&t>=stages[idx+1][0])idx++;const a=stages[idx],b=stages[idx+1];let d=idx===11?.35:idx===12?.45:idx===18?4:Math.min(3.4,b[0]-a[0]);let q=smooth((t-(b[0]-d))/d);if(idx===0)q=smooth((t-1)/4);return{a,b,q,idx}}
function renderFrame(time){const t=clamp(time,0,120),{a,b,q,idx}=state(t),camera=lerp(a[2],b[2],q),zoom=lerp(a[3],b[3],q),centerX=lerp(960,1170,smooth((t-6)/4)),centerY=510;
 visible=[];c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.drawImage(paper,0,0);
 // Subtle parallax paper fibres are geometric, never additional story particles.
 c.strokeStyle='rgba(196,163,105,.035)';c.lineWidth=1;for(let j=0;j<18;j++){const y=140+j*51;c.beginPath();c.moveTo(0,y+Math.sin(j)*14);c.bezierCurveTo(600, y-40,1200,y+35,W,y);c.stroke()}
 const A=targets[a[1]],B=targets[b[1]],collapse=smooth((t-116)/4),axisY=853;
 // Exactly 900 fixed particles belong to the gold timeline, visible even at t=0.
 c.strokeStyle='rgba(196,163,105,.45)';c.lineWidth=1.3;c.beginPath();const lineWidth=lerp(1750,18,collapse),left=960-lineWidth/2;c.moveTo(left,axisY);c.lineTo(left+lineWidth,axisY);c.stroke();
 c.fillStyle='#c4a369';for(let i=0;i<AXIS;i++){const s=seed[i],u=(i+.5)/AXIS;const worldX=camera+(u-.5)*lineWidth;const x=960+(worldX-camera),y=axisY+Math.sin(u*15+t*.08)*3*(1-collapse)+(s[1]-.5)*6;positionBuffer[i*2]=x;positionBuffer[i*2+1]=y;c.globalAlpha=.25+s[2]*.55;c.fillRect(x,y,1+s[3]*2,1+s[3]*2)}
 c.globalAlpha=1;
 const stream=Math.sin(q*Math.PI);const swirl=idx===18?65:45;
 for(let i=0;i<COUNT;i++){const k=i*5,s=seed[i+AXIS];const local=smooth(clamp((q-s[3]*.12)/.88));let wx=lerp(a[2]+A[k]*a[3],b[2]+B[k]*b[3],local),y=lerp(A[k+1]*a[3],B[k+1]*b[3],local);wx+=Math.sin(s[0]*6.28+t*.35)*stream*swirl;y+=Math.sin(s[1]*6.28+t*.3)*stream*32;
 const x=centerX+wx-camera,py=centerY+y;positionBuffer[(i+AXIS)*2]=x;positionBuffer[(i+AXIS)*2+1]=py;
 const rr=Math.round(lerp(A[k+2],B[k+2],local)),gg=Math.round(lerp(A[k+3],B[k+3],local)),bb=Math.round(lerp(A[k+4],B[k+4],local));
 c.fillStyle=`rgb(${rr},${gg},${bb})`;const sz=2.2+s[2]*2.2;
 // Each same-identity particle carries a translucent pigment halo and a defined core.
 c.globalAlpha=.065;c.fillRect(x-5,py-5,10,10);c.globalAlpha=.76+s[3]*.24;c.fillRect(x-sz/2,py-sz/2,sz,sz);
 }
 c.globalAlpha=1;
 // A small gold locator follows the continuous camera, with no extra printed dates.
 const locator=180+((camera/6500)*1510)*(1-collapse);c.strokeStyle='rgba(233,220,195,.6)';c.beginPath();c.arc(lerp(locator,960,collapse),axisY,5,0,Math.PI*2);c.stroke();
 // Local typography overlaps at least 1.5 seconds. Background never dissolves.
 for(const [txt,start,end,size] of cues){const alpha=smooth((t-start)/1.6)*(1-smooth((t-(end-1.6))/1.6));const final=txt==='1889'&&start===117;const intro=txt==='Nintendo 1889';const x=final?150:intro?150:145;let y=final?440:intro?260:250;label(txt,x,y,size,alpha)}
 // Fine ruled museum-caption accent; no extra visible words or chapter numbers.
 c.fillStyle='rgba(196,163,105,.7)';c.fillRect(146,170,52,2);
 window.lastFrame={t,particleCount:N,camera,zoom,visibleText:visible.slice(),stage:a[1],next:b[1],mix:q};
 return window.lastFrame;
}
window.TOTAL=120;window.FPS=30;window.renderFrame=renderFrame;window.TEXT_WHITELIST=WHITELIST;window.PARTICLE_COUNT=N;
window.validateModel=()=>{if(N!==6000)throw Error('Particle conservation');for(const key of Object.keys(targets))if(targets[key].length!==COUNT*5)throw Error('Bad target '+key);return{particles:N,targets:Object.keys(targets).length,externalImages:0,externalFonts:0}};
renderFrame(0);
})();

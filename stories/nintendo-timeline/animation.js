const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const W=1920,H=1080,INK='#e9dcc3',GOLD='#c4a369',RED='#95574e',BLUE='#637b87',SAGE='#8e9a78';
const serif='"Noto Serif CJK SC",serif';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,q)=>a+(b-a)*q;
const ease=q=>{q=clamp(q);return q*q*(3-2*q)},fade=(t,a,b,d=1.8)=>ease((t-a)/d)*(1-ease((t-b)/d));
const rnd=i=>{const n=Math.sin(i*127.1+91.7)*43758.5453;return n-Math.floor(n)};
const imgs={};window.assetsReady=Promise.all(['kyoto','paris','story-atlas'].map(k=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{imgs[k]=im;resolve()};im.onerror=reject;im.src='assets/'+k+'.png'})));
const paper=document.createElement('canvas');paper.width=960;paper.height=540;const pc=paper.getContext('2d');
pc.fillStyle='#241e19';pc.fillRect(0,0,960,540);
for(let i=0;i<16000;i++){pc.fillStyle=`rgba(${i%2?'233,220,195':'5,2,0'},${.01+rnd(i+6)*.035})`;pc.fillRect(rnd(i)*960,rnd(i+2)*540,1+rnd(i+8)*3,1)}
function text(s,x,y,size=44,col=INK,align='left',alpha=1,font=serif){ctx.save();ctx.globalAlpha*=clamp(alpha);ctx.font=`400 ${size}px ${font}`;ctx.fillStyle=col;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);ctx.restore()}
function line(points,color=GOLD,width=2,a=1){ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore()}
function box(x,y,w,h,r,fill,stroke=GOLD,lw=2){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function dot(x,y,r,col=GOLD,a=1){ctx.save();ctx.globalAlpha*=a;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
function art(key,x,y,w,h,a=1,crop=null){if(!imgs[key]||a<=0)return;ctx.save();ctx.globalAlpha*=a;const im=imgs[key];ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.clip();if(crop){const [col,row]=crop;ctx.drawImage(im,im.width*col/2,im.height*row/3,im.width/2,im.height/3,x,y,w,h)}else ctx.drawImage(im,x,y,w,h);const g=ctx.createRadialGradient(x+w/2,y+h/2,w*.25,x+w/2,y+h/2,w*.53);g.addColorStop(0,'rgba(36,30,25,0)');g.addColorStop(.72,'rgba(36,30,25,.12)');g.addColorStop(1,'rgba(36,30,25,1)');ctx.fillStyle=g;ctx.fillRect(x-5,y-5,w+10,h+10);ctx.restore()}
// All outlines use the same set of particles, so changing historical objects are true point morphs.
function samples(segments,count=660){const edges=[];let total=0;for(const path of segments)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d){edges.push({a,b,d,start:total});total+=d}}
return Array.from({length:count},(_,i)=>{const n=i/count*total;const e=edges.find(e=>n<=e.start+e.d)||edges.at(-1),q=(n-e.start)/e.d;return[mix(e.a[0],e.b[0],q),mix(e.a[1],e.b[1],q)]})}
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]];
const shapes={
 card:[rect(-150,-215,300,430),rect(-125,-190,250,380),[[-105,160],[-60,70],[-20,110],[35,-60],[70,-100]],[[35,-60],[-45,-105],[-95,-90]],[[0,30],[90,-20],[110,-75]]],
 tower:[[[0,-260],[-32,-90],[-75,60],[-170,230],[-105,230],[-48,125],[48,125],[105,230],[170,230],[75,60],[32,-90],[0,-260]],[[-55,-5],[55,-5]],[[-95,95],[95,95]],[[-31,-85],[31,-85]],[[-120,160],[95,95]],[[-95,95],[120,160]],[[-75,60],[55,-5]],[[-55,-5],[75,60]],[[-32,-90],[32,-35]],[[32,-90],[-32,-35]]],
 toy:[rect(-260,110,120,100),[[-190,110],[-120,45],[-20,45],[65,-35],[160,-35],[245,-115]],[[-190,110],[-170,45],[-70,45],[15,-35],[110,-35],[245,-115]],[[245,-115],[210,-175],[275,-195]],[[245,-115],[305,-80],[335,-125]]],
 fc:[rect(-255,-105,510,240),rect(-210,-70,420,50),rect(-100,-125,200,45),rect(-215,65,430,55),rect(-120,170,310,100),[[-95,220],[-45,220]],[[-70,195],[-70,245]],[[100,200],[120,220],[100,240]],[[150,200],[170,220],[150,240]]],
 gb:[rect(-140,-230,280,455),rect(-105,-185,210,180),rect(-78,-160,156,130),[[-93,60],[-33,60]],[[-63,30],[-63,90]],[[35,60],[55,40],[75,60],[55,80],[35,60]],[[80,40],[100,20],[120,40],[100,60],[80,40]],[[-35,150],[5,135]],[[20,150],[60,135]]],
 wii:[rect(-65,-240,130,480),rect(-32,-215,64,95),[[-30,-10],[30,-10]],[[0,-40],[0,20]],[[0,70],[20,90],[0,110],[-20,90],[0,70]],[[-20,160],[20,160]],[[0,240],[25,300],[-20,330]]],
 switch:[rect(-330,-145,660,290),rect(-235,-125,470,250),rect(-205,-100,410,200),[[-235,-145],[-235,145]],[[235,-145],[235,145]],[[-300,-30],[-265,-30]],[[-282,-47],[-282,-13]],[[270,-70],[295,-45],[270,-20],[245,-45],[270,-70]],[[270,55],[285,70],[270,85],[255,70],[270,55]]]
};
// Floral petals belong to hanafuda, with no poker symbols.
for(let j=0;j<6;j++){const cx=-60+j%3*65,cy=-80+Math.floor(j/3)*100;for(let k=0;k<5;k++){const an=k/5*Math.PI*2;shapes.card.push([[cx,cy],[cx+Math.cos(an-.35)*28,cy+Math.sin(an-.35)*28],[cx+Math.cos(an)*39,cy+Math.sin(an)*39],[cx+Math.cos(an+.35)*28,cy+Math.sin(an+.35)*28],[cx,cy]])}}
const clouds=Object.fromEntries(Object.entries(shapes).map(([k,v])=>[k,samples(v)]));
const morphKeys=[[0,'card'],[23,'card'],[29,'tower'],[45,'tower'],[50,'card'],[56,'toy'],[63,'toy'],[69,'fc'],[73,'fc'],[79,'gb'],[83,'gb'],[89,'wii'],[93,'wii'],[99,'switch'],[104,'switch'],[112,'card'],[120,'card']];
function morphState(t){let i=0;while(i<morphKeys.length-2&&t>morphKeys[i+1][0])i++;const[a,ka]=morphKeys[i],[b,kb]=morphKeys[i+1];return{a:ka,b:kb,q:ease((t-a)/(b-a))}}
function morph(t,x,y,scale,alpha){const m=morphState(t),aa=clouds[m.a],bb=clouds[m.b];ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.scale(scale,scale);for(let i=0;i<aa.length;i++){const curl=Math.sin(i*.6+t*.4)*Math.sin(m.q*Math.PI)*14;const px=mix(aa[i][0],bb[i][0],m.q)+curl,py=mix(aa[i][1],bb[i][1],m.q)+Math.cos(i+t*.3)*Math.sin(m.q*Math.PI)*12;dot(px,py,1.1+(i%7===0?.5:0),i%9===0?INK:GOLD,.50+.45*rnd(i));}ctx.restore()}
function machine(kind,x,y,s,a){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;
if(kind==='fc'){box(-255,-105,510,240,22,'#c7bea9',null);box(-255,45,510,90,10,RED,null);box(-100,-125,200,48,6,'#3c322b',null);box(-215,-70,430,50,5,'#aaa08d',null);for(let i=0;i<18;i++)line([[-220+i*25,-15],[-220+i*25,15]],'#7b7568',3,.65);box(-120,170,310,100,12,RED,null);box(-102,187,120,66,6,'#c7bea9',null);line([[-85,220],[-35,220]],'#302a24',14);line([[-60,195],[-60,245]],'#302a24',14);dot(102,215,13,'#3c322b');dot(150,215,13,'#3c322b');line([[180,175],[240,150],[290,195]],'#5a4b3f',3)}
if(kind==='gb'){box(-140,-230,280,455,24,'#bcbba9',null);box(-105,-185,210,180,14,'#5c6260',null);box(-78,-160,156,130,4,'#82916a',null);line([[-93,60],[-33,60]],'#383b37',22);line([[-63,30],[-63,90]],'#383b37',22);dot(55,60,20,RED);dot(100,40,20,RED);line([[-35,150],[5,135]],'#6f736a',10);line([[20,150],[60,135]],'#6f736a',10);for(let i=0;i<5;i++)line([[45+i*15,180],[65+i*15,205]],'#86887e',3)}
if(kind==='wii'){box(-65,-240,130,480,32,'#d0cfc1',null);box(-32,-215,64,95,4,'#444e50',null);line([[-30,-10],[30,-10]],'#697173',16);line([[0,-40],[0,20]],'#697173',16);dot(0,90,25,'#b2b8b0');dot(0,90,12,'#6e838c');for(let i=0;i<4;i++)dot(-30+i*20,190,3,BLUE);line([[0,240],[25,300],[-20,330]],'#c9c7b6',3)}
if(kind==='switch'){box(-330,-145,660,290,55,'#333b3b',null);box(-330,-145,95,290,45,BLUE,null);box(235,-145,95,290,45,RED,null);box(-215,-120,430,240,9,'#161e1f',null);const gr=ctx.createRadialGradient(0,0,0,0,0,220);gr.addColorStop(0,'#35493e');gr.addColorStop(1,'#172020');ctx.fillStyle=gr;ctx.fillRect(-200,-105,400,210);dot(-282,-30,19,'#303c40');dot(270,70,19,'#343839');for(let k=0;k<4;k++)dot(270+Math.cos(k*Math.PI/2)*22,-45+Math.sin(k*Math.PI/2)*22,7,'#303638')}
ctx.restore()}
function flowerCard(x,y,s,a){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;box(-150,-215,300,430,5,'#d4c5a6','#7a6752',5);line([[-110,165],[-70,95],[-35,110],[20,-55],[70,-105]],'#56674d',14);line([[5,-30],[-65,-100],[-110,-84]],'#56674d',8);for(let j=0;j<6;j++){const cx=-60+j%3*65,cy=-80+Math.floor(j/3)*100;for(let k=0;k<5;k++){const an=k/5*Math.PI*2;ctx.save();ctx.translate(cx,cy);ctx.rotate(an);ctx.fillStyle=RED;ctx.beginPath();ctx.ellipse(0,-18,13,24,0,0,Math.PI*2);ctx.fill();ctx.restore()}dot(cx,cy,5,'#c7a55e')}ctx.restore()}
function toy(x,y,s,a,t){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;const ext=1+.07*Math.sin(t*.5);ctx.scale(ext,1);box(-265,110,120,100,16,RED,null);for(let j=0;j<4;j++){const x=-190+j*100,y=110-j*60;line([[x,y],[x+100,y-120]],'#baaf95',13);line([[x,y-100],[x+100,y-20]],'#d1c4a6',13);dot(x+50,y-60,7,'#74624a')}line([[210,-130],[255,-180],[290,-160]],RED,19);line([[210,-130],[290,-80],[310,-110]],RED,19);ctx.restore()}
function taxi(x,y,s,a){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha*=a;box(-130,-30,260,85,18,'#727e67',GOLD,1);ctx.fillStyle='#727e67';ctx.beginPath();ctx.moveTo(-95,-30);ctx.lineTo(-55,-90);ctx.lineTo(60,-90);ctx.lineTo(105,-30);ctx.fill();box(-50,-78,50,44,3,'#b2b8a2',null);box(10,-78,48,44,3,'#b2b8a2',null);dot(-80,55,29,'#3c3329');dot(80,55,29,'#3c3329');dot(-80,55,12,'#9a947b');dot(80,55,12,'#9a947b');box(-15,-110,45,20,4,GOLD,null);ctx.restore()}
function rice(x,y,s,a){ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);box(-75,-110,150,175,8,'#b4a17c',GOLD,1);ctx.fillStyle=RED;ctx.beginPath();ctx.arc(0,-20,47,Math.PI,0);ctx.fill();ctx.fillStyle='#cfc1a0';ctx.beginPath();ctx.ellipse(0,65,85,25,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(0,55,72,0,Math.PI);ctx.fill();for(let i=0;i<100;i++)dot((rnd(i)*2-1)*65,50-rnd(i+4)*30,2.3,INK);ctx.restore()}
function timeline(t){const show=ease((t-1)/4)*(1-ease((t-117)/3));ctx.save();ctx.globalAlpha*=show;const reveal=ease((t-1.6)/4);const pts=[];for(let x=95;x<1825*reveal;x+=8)pts.push([x,826+Math.sin(x*.004+t*.13)*8]);if(pts.length>1){line(pts,GOLD,2.4,.6);line(pts,GOLD,11,.035)}for(let i=0;i<85;i++){const x=95+((rnd(i)*1730+t*(10+i%5*3))%1730),y=826+Math.sin(x*.004+t*.13)*8;dot(x,y,1.2+i%3*.4,GOLD,.25+.5*rnd(i+3))}const dates=t<63?['1889','1966','1983','1989','2006','2017']:['1889','1966','1983','1989','2006','2017'];dates.forEach((d,i)=>{const x=140+i*328;dot(x,826+Math.sin(x*.004+t*.13)*8,4,GOLD,.8);let vis=.2;if((t<55&&i==0)||(t>=55&&t<65&&i==1)||(t>=65&&t<75&&i==2)||(t>=75&&t<85&&i==3)||(t>=85&&t<95&&i==4)||(t>=95&&i==5))vis=1;text(d,x,882,31,GOLD,'center',vis,'Georgia')});ctx.restore()}
function titleBlock(t,a,b,small,big,sub=''){const q=fade(t,a,b);text(small,145,230,32,GOLD,'left',q);text(big,140,352,78,INK,'left',q);if(sub)text(sub,145,455,35,INK,'left',q*.8)}
window.renderFrame=function(t){ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.drawImage(paper,0,0,W,H);const wash=ctx.createRadialGradient(1200,420,20,1200,420,900);wash.addColorStop(0,'rgba(155,118,67,.11)');wash.addColorStop(1,'rgba(36,30,25,0)');ctx.fillStyle=wash;ctx.fillRect(0,0,W,H);
 // Paper fibres and slow dust have fixed deterministic trajectories.
 for(let i=0;i<100;i++){const x=(rnd(i)*W+t*(.6+i%5*.3))%W,y=(rnd(i+6)*H-t*.4+H)%H;dot(x,y,.6+rnd(i+8)*1.1,GOLD,.03+.09*rnd(i+4))}
 timeline(t);
 const intro=fade(t,.1,7,2);text('Nintendo',960,385,116,INK,'center',intro,'Georgia');text('1889',960,535,130,GOLD,'center',intro*ease((t-2)/3),'Georgia');
 const ky=fade(t,6,24,2.3);art('kyoto',710-8*Math.sin(t*.05),150,1120,660,ky*.8);titleBlock(t,6,15,'1889','京都','一间花札小店');
 const card=fade(t,14,26,2);titleBlock(t,14,26,'1889 · 京都','花札纸牌','手工绘制的花与四季');flowerCard(1260,455,1.0+.02*Math.sin(t*.2),card*.85);
 // The floral point cloud becomes the tower lattice continuously, never a cut.
 const pa=fade(t,27,36,2);art('paris',760,120,1000,690,pa*.43);titleBlock(t,26,36,'1889 · 巴黎','埃菲尔铁塔竣工');
 const both=fade(t,35,45,2);art('kyoto',100,175,805,530,both*.78);art('paris',1015,175,805,530,both*.78);text('1889',960,600,112,GOLD,'center',both,'Georgia');text('同一年，两个世界',960,726,56,INK,'center',both);text('京都',420,170,34,INK,'center',both);text('巴黎',1500,170,34,INK,'center',both);
 const biz=fade(t,45,55,2);titleBlock(t,45,55,'纸牌之后','寻找新的方向');rice(950+Math.sin(t*.2)*10,460,1.1,biz*ease((t-46)/2));taxi(1430,485,1.25,biz*ease((t-48)/2));
 const toys=fade(t,55,65,2);titleBlock(t,55,65,'1966','玩具制造','Ultra Hand · 超怪手');toy(1240,440,1.12,toys*.9,t);
 for(const [start,end,kind,year,name] of [[65,75,'fc','1983','红白机'],[75,85,'gb','1989','Game Boy'],[85,95,'wii','2006','Wii'],[95,105,'switch','2017','Switch']]){const q=fade(t,start+2,end-1,2);machine(kind,1260,450,1.03,q);titleBlock(t,start+1,end-1,year,name)}
 const back=fade(t,104,113,2);flowerCard(1260,450,1.0,back*.75);titleBlock(t,105,115,'1889 → 2017','从花札到游戏世界');
 let mx=1260,my=450,sz=1.02,ma=fade(t,15,115,2.3)*.88*(1-ease((t-113)/2));if(t>=35&&t<45)ma*=1-both;
 morph(t,mx,my,sz,ma);
 // Streams connect the objects to the same river of time throughout the film.
 const stream=fade(t,8,115,3);for(let i=0;i<90;i++){const q=(i/90+t*.025)%1;const x=mix(1260,1500,q)+Math.sin(q*Math.PI*2+t*.1)*28,y=mix(635,826,q);dot(x,y,1.2,GOLD,stream*.17*Math.sin(q*Math.PI))}
 const end=fade(t,115,120,2);text('从花札到游戏世界',960,260,65,INK,'center',end);text('1889',960,515,142,GOLD,'center',end,'Georgia');
 // Final picture, timeline and particles settle into the paper together.
 const close=ease((t-118)/2);ctx.fillStyle=`rgba(36,30,25,${close})`;ctx.fillRect(0,0,W,H);
};

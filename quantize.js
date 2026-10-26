// Count quantized source colors, never average neighboring pixels.
export function dominantGrid(data,width,height,columns,rows,{inset=0,transparentEmpty=false}={}){
 const cells=[];
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const votes=new Map();let transparent=0,total=0;
  let x0=Math.floor(col*width/columns),x1=Math.floor((col+1)*width/columns);
  let y0=Math.floor(row*height/rows),y1=Math.floor((row+1)*height/rows);
  const dx=Math.min(Math.floor((x1-x0)*inset),Math.floor((x1-x0-1)/2)),dy=Math.min(Math.floor((y1-y0)*inset),Math.floor((y1-y0-1)/2));x0+=dx;x1-=dx;y0+=dy;y1-=dy;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const i=(y*width+x)*4,a=data[i+3]/255;total++;if(transparentEmpty&&a<.1){transparent++;continue;}
   const rgb=[0,1,2].map(k=>Math.round((data[i+k]*a+255*(1-a))/8)*8).map(v=>Math.min(255,v));
   const key=rgb.join(',');votes.set(key,(votes.get(key)||0)+1);
  }
  let winner='255,255,255',count=0;
  for(const [key,n] of votes)if(n>count){winner=key;count=n;}
  cells.push(transparentEmpty&&transparent>=total/2?null:winner.split(',').map(Number));
 }
 return cells;
}
export function reducePalette(cells,limit){
 const counts=new Map();for(const c of cells){const k=c.join(',');counts.set(k,(counts.get(k)||0)+1);}
 // Weighted median cut keeps rare but distinct colors better than top-frequency selection.
 let boxes=[[...counts].map(([key,n])=>({rgb:key.split(',').map(Number),n}))];
 const spread=b=>[0,1,2].map(k=>b.reduce((m,c)=>Math.max(m,c.rgb[k]),0)-b.reduce((m,c)=>Math.min(m,c.rgb[k]),255));
 while(boxes.length<limit){let index=-1,score=-1;boxes.forEach((b,i)=>{const s=Math.max(...spread(b));if(b.length>1&&s>score){index=i;score=s;}});if(index<0)break;
 const b=boxes[index],ranges=spread(b),axis=ranges.indexOf(Math.max(...ranges));b.sort((a,c)=>a.rgb[axis]-c.rgb[axis]);
 const half=b.reduce((s,c)=>s+c.n,0)/2;let sum=0,cut=1;for(let i=0;i<b.length-1;i++){sum+=b[i].n;cut=i+1;if(sum>=half)break;}boxes.splice(index,1,b.slice(0,cut),b.slice(cut));
 }
 const palette=boxes.map(b=>b.reduce((a,c)=>c.n>a.n?c:a).rgb);
 return cells.map(c=>palette.reduce((best,p)=>distance(c,p)<distance(c,best)?p:best));
}
function distance(a,b){return a.reduce((s,v,i)=>s+(v-b[i])**2,0);}

// Local, deterministic labels for this chart; these are not brand bead color codes.
export function suggestColorNumbers(keys){
 const rank=key=>{const rgb=key.split(',').map(Number),[r,g,b]=rgb.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;let hue=0;if(delta){hue=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;hue=(hue*60+360)%360;}const neutral=delta<.08||max===0;const light=.2126*r+.7152*g+.0722*b;return [neutral?0:1,neutral?0:Math.floor(hue/30),light,hue,...rgb];};
 const entries=[...new Set(keys)].map(key=>({key,rank:rank(key)}));
 entries.sort((a,b)=>{for(let i=0;i<a.rank.length;i++){const difference=a.rank[i]-b.rank[i];if(difference)return difference;}return 0;});
 return new Map(entries.map(({key},i)=>[key,String(i+1)]));
}

export function fitGridToBoard(pattern,width,height,boardWidth,boardHeight,{shrink=false}={}){
 if(![width,height,boardWidth,boardHeight].every(n=>Number.isInteger(n)&&n>0)||pattern.length!==width*height)throw Error('网格尺寸无效');
 let w=width,h=height,grid=pattern;
 if(w>boardWidth||h>boardHeight){if(!shrink)throw Error('图案超过所选拼豆板，请换大板或允许等比缩小。');const scale=Math.min(boardWidth/w,boardHeight/h);w=Math.max(1,Math.floor(w*scale));h=Math.max(1,Math.floor(h*scale));grid=[];for(let row=0;row<h;row++)for(let col=0;col<w;col++){const votes=new Map();for(let y=Math.floor(row*height/h);y<Math.floor((row+1)*height/h);y++)for(let x=Math.floor(col*width/w);x<Math.floor((col+1)*width/w);x++){const rgb=pattern[y*width+x],key=rgb?rgb.join(','):'empty';const previous=votes.get(key);votes.set(key,{rgb,count:(previous?.count||0)+1});}let winner=null,count=-1;for(const value of votes.values())if(value.count>count){winner=value.rgb;count=value.count;}grid.push(winner);}}
 const offsetX=Math.floor((boardWidth-w)/2),offsetY=Math.floor((boardHeight-h)/2),cells=Array(boardWidth*boardHeight).fill(null);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)cells[(offsetY+y)*boardWidth+offsetX+x]=grid[y*w+x];
 return {cells,patternWidth:w,patternHeight:h,offsetX,offsetY};
}

export function shopBoardPlan(columns,rows){
 if(![columns,rows].every(n=>Number.isInteger(n)&&n>0))throw Error('图纸行列数无效');
 const size=[52,78,108].find(size=>columns<=size&&rows<=size);
 return {columns,rows,capacity:columns*rows,fits:!!size,boardNumber:size?[52,78,108].indexOf(size)+1:null,boardSize:size||null};
}

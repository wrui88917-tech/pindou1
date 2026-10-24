// Count quantized source colors, never average neighboring pixels.
export function dominantGrid(data,width,height,columns,rows){
 const cells=[];
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const votes=new Map();
  const x0=Math.floor(col*width/columns),x1=Math.floor((col+1)*width/columns);
  const y0=Math.floor(row*height/rows),y1=Math.floor((row+1)*height/rows);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const i=(y*width+x)*4,a=data[i+3]/255;
   const rgb=[0,1,2].map(k=>Math.round((data[i+k]*a+255*(1-a))/8)*8).map(v=>Math.min(255,v));
   const key=rgb.join(',');votes.set(key,(votes.get(key)||0)+1);
  }
  let winner='255,255,255',count=0;
  for(const [key,n] of votes)if(n>count){winner=key;count=n;}
  cells.push(winner.split(',').map(Number));
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

// Raster chart for third-party OCR tests. Recognition must be checked on the target site.
export function drawImportChart(out,{columns,rows,cells,codeFor,labelStyle='color',coordinates=true,strictCodes=true}){
 if(!Number.isInteger(columns)||!Number.isInteger(rows)||columns<1||rows<1||columns>200||rows>320||cells.length!==columns*rows)throw Error('图纸尺寸无效');
 const counts=new Map(),codes=new Map(),used=new Map();
 for(const rgb of cells){if(!rgb)continue;const key=rgb.join(',');if(!codes.has(key)){const code=String(codeFor(key)||'').trim();if(strictCodes?!/^[A-Z][0-9]{1,3}$/.test(code):!/^\S{1,8}$/u.test(code))throw Error('请先恢复有效色号；测试PNG要求字母加数字，图片型PDF编号最多8个非空字符。');if(used.has(code)&&used.get(code)!==key)throw Error('存在重复色号，请先修正。');used.set(code,key);codes.set(key,code);}counts.set(key,(counts.get(key)||0)+1);}
 const unit=48,margin=coordinates?64:32,gap=16,item=104,entries=[...counts],legendCols=Math.max(1,Math.floor(columns*unit/(item+gap))),legendRows=Math.ceil(entries.length/legendCols),bottom=margin+rows*unit;
 const legendTop=bottom+112;
 out.width=Math.max(columns*unit+margin*2,360);out.height=legendTop+legendRows*72+56;
 const c=out.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,out.width,out.height);c.textAlign='center';c.textBaseline='middle';
 cells.forEach((rgb,i)=>{const x=margin+i%columns*unit,y=margin+Math.floor(i/columns)*unit;c.fillStyle=rgb?`rgb(${rgb})`:'#f1f3f5';c.fillRect(x,y,unit,unit);if(!rgb)return;c.fillStyle=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#111111':'#ffffff';if(labelStyle==='white'){c.fillStyle='#ffffff';c.fillRect(x+5,y+11,unit-10,26);c.fillStyle='#000000';}c.font='bold 22px Arial, sans-serif';c.fillText(codes.get(rgb.join(',')),x+unit/2,y+unit/2,unit-4);});
 // Continuous lines include all empty rows/columns. No dashed or colored lines competing with the boundary.
 c.setLineDash([]);
 for(const [n,horizontal] of [[columns,false],[rows,true]])for(let i=0;i<=n;i++){
  c.beginPath();c.strokeStyle=i%10===0?'#606b7b':'#9ba7b7';c.lineWidth=i%10===0?1.6:1;
  if(horizontal){c.moveTo(margin,margin+i*unit);c.lineTo(margin+columns*unit,margin+i*unit);}else{c.moveTo(margin+i*unit,margin);c.lineTo(margin+i*unit,bottom);}c.stroke();
  if(coordinates&&i<n){c.fillStyle='#65738a';c.font='11px Arial, sans-serif';if(horizontal){c.fillText(i+1,margin-32,margin+(i+.5)*unit);c.fillText(i+1,margin+columns*unit+32,margin+(i+.5)*unit);}else{c.fillText(i+1,margin+(i+.5)*unit,margin-32);c.fillText(i+1,margin+(i+.5)*unit,bottom+32);}}
 }
 c.strokeStyle='#263344';c.lineWidth=4;c.strokeRect(margin,margin,columns*unit,rows*unit);
 entries.forEach(([key,n],i)=>{const x=margin+i%legendCols*(item+gap),y=legendTop+Math.floor(i/legendCols)*72,rgb=key.split(',').map(Number);c.fillStyle=`rgb(${key})`;c.fillRect(x,y,item,30);c.strokeStyle='#aab4c4';c.lineWidth=1;c.strokeRect(x,y,item,30);c.fillStyle=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#111':'#fff';c.font='bold 16px Arial, sans-serif';c.fillText(codes.get(key),x+item/2,y+15);c.fillStyle='#263123';c.font='bold 15px Arial, sans-serif';c.fillText(n,x+item/2,y+48);});
 const total=[...counts.values()].reduce((a,b)=>a+b,0);c.font='14px Arial, sans-serif';c.fillStyle='#263123';c.fillText(`${columns} x ${rows} / ${entries.length} colors / ${total} beads`,out.width/2,out.height-24);
 return {columns,rows,total,empty:cells.length-total,colors:entries.map(([key,count])=>({code:codes.get(key),rgb:key,count}))};
}

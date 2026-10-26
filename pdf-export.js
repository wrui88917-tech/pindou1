// A self-contained single-page vector PDF. No remote service or library required.
export function createChartPDF({columns,rows,cells,codeFor}){
 if(![columns,rows].every(n=>Number.isInteger(n)&&n>0&&n<=108)||cells.length!==columns*rows)throw Error('PDF图纸行列数无效或超过108×108。');
 const palette=new Map(),labels=new Map(),codes=new Map();
 for(const rgb of cells){if(!rgb)continue;if(!Array.isArray(rgb)||rgb.length!==3||rgb.some(n=>!Number.isInteger(n)||n<0||n>255))throw Error('PDF颜色数据无效。');const key=rgb.join(',');if(!palette.has(key)){const label=String(codeFor(key)||'').trim();if(!/^[\x21-\x7e]{1,8}$/.test(label))throw Error('PDF色号请使用1–8位英文字母、数字或符号；请先恢复标准色号。');if(codes.has(label)&&codes.get(label)!==key)throw Error('PDF色号重复，请先修正。');labels.set(key,label);codes.set(label,key);palette.set(key,0);}palette.set(key,palette.get(key)+1);}
 const unit=18,margin=40,itemWidth=72,gap=8,legendColumns=Math.max(1,Math.floor(columns*unit/(itemWidth+gap))),entries=[...palette],legendRows=Math.ceil(entries.length/legendColumns),legendHeight=Math.max(1,legendRows)*40;
 const width=Math.max(320,columns*unit+margin*2),height=margin*2+32+rows*unit+48+legendHeight,top=height-margin-32,bottom=top-rows*unit;
 const commands=[],number=value=>Number(value.toFixed(3)).toString(),escape=value=>String(value).replace(/[\\()]/g,'\\$&'),color=rgb=>rgb.map(v=>number(v/255)).join(' ');
 const rect=(x,y,w,h,rgb)=>commands.push(`${color(rgb)} rg ${number(x)} ${number(y)} ${number(w)} ${number(h)} re f`);
 const text=(value,x,y,size=7,rgb=[0,0,0],center=true)=>{const label=String(value);const start=center?x-label.length*size*.278:x;commands.push(`${color(rgb)} rg BT /F1 ${number(size)} Tf 1 0 0 1 ${number(start)} ${number(y)} Tm (${escape(label)}) Tj ET`);};
 const total=[...palette.values()].reduce((a,b)=>a+b,0);
 text(`Bead chart [${columns}x${rows} / ${entries.length} colors / ${total} beads]`,margin,top+27,10,[35,48,35],false);
 cells.forEach((rgb,i)=>{if(!rgb)return;const x=margin+i%columns*unit,y=top-(Math.floor(i/columns)+1)*unit;rect(x,y,unit,unit,rgb);const label=labels.get(rgb.join(',')),font=Math.min(7,15/(label.length*.6));text(label,x+unit/2,y+(unit-font)/2+1,font,rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?[0,0,0]:[255,255,255]);});
 commands.push('[] 0 d');
 for(const [n,horizontal] of [[columns,false],[rows,true]])for(let i=0;i<=n;i++){commands.push(`${i%10===0?'0.32 0.38 0.43':'0.64 0.68 0.71'} RG ${i%10===0?'.6':'.2'} w`);commands.push(horizontal?`${margin} ${number(top-i*unit)} m ${margin+columns*unit} ${number(top-i*unit)} l S`:`${number(margin+i*unit)} ${bottom} m ${number(margin+i*unit)} ${top} l S`);if(i<n){if(horizontal){text(i+1,margin-15,top-(i+.5)*unit-2,4.5,[90,100,110]);text(i+1,margin+columns*unit+15,top-(i+.5)*unit-2,4.5,[90,100,110]);}else{text(i+1,margin+(i+.5)*unit,top+10,4.5,[90,100,110]);text(i+1,margin+(i+.5)*unit,bottom-13,4.5,[90,100,110]);}}}
 commands.push(`0.15 0.2 0.25 RG 1 w ${margin} ${bottom} ${columns*unit} ${rows*unit} re S`);
 entries.forEach(([key,count],i)=>{const x=margin+i%legendColumns*(itemWidth+gap),y=bottom-48-Math.floor(i/legendColumns)*40,rgb=key.split(',').map(Number);rect(x,y,itemWidth,16,rgb);commands.push(`0.6 0.65 0.7 RG .3 w ${x} ${y} ${itemWidth} 16 re S`);text(labels.get(key),x+itemWidth/2,y+5,8,rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?[0,0,0]:[255,255,255]);text(count,x+itemWidth/2,y-12,8);});
 const stream=commands.join('\n')+'\n';
 const objects=[
 '<< /Type /Catalog /Pages 2 0 R >>',
 '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
 `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
 '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
 `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
 `<< /Title (Bead chart ${columns}x${rows}) /Creator (Bead Studio) >>`
 ];
 let pdf='%PDF-1.4\n',offsets=[0];objects.forEach((body,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${body}\nendobj\n`;});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('');pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
 return new TextEncoder().encode(pdf);
}

// Image-only variant: exactly one RGB image per page, with no PDF font or text operators.
export async function createImagePDF({width,height,rgba}){
 if(![width,height].every(n=>Number.isInteger(n)&&n>0&&n<=10000)||rgba.length!==width*height*4)throw Error('PDF图片数据无效。');
 const rgb=new Uint8Array(width*height*3);
 for(let i=0,j=0;i<rgba.length;i+=4,j+=3){const alpha=rgba[i+3]/255;for(let k=0;k<3;k++)rgb[j+k]=Math.round(rgba[i+k]*alpha+255*(1-alpha));}
 let data=rgb,filter='';
 if(typeof CompressionStream!=='undefined'){data=new Uint8Array(await new Response(new Blob([rgb]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());filter=' /Filter /FlateDecode';}
 const encode=value=>new TextEncoder().encode(value),pageWidth=width*.5,pageHeight=height*.5,content=`q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
 const chunks=[encode('%PDF-1.4\n')],offsets=[0];let length=chunks[0].length;
 const append=part=>{chunks.push(part);length+=part.length;};
 const object=(id,parts)=>{offsets.push(length);append(encode(`${id} 0 obj\n`));for(const part of parts)append(typeof part==='string'?encode(part):part);append(encode('\nendobj\n'));};
 object(1,['<< /Type /Catalog /Pages 2 0 R >>']);
 object(2,['<< /Type /Pages /Kids [3 0 R] /Count 1 >>']);
 object(3,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`]);
 object(4,[`<< /Length ${encode(content).length} >>\nstream\n${content}endstream`]);
 object(5,[`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8${filter} /Length ${data.length} >>\nstream\n`,data,'\nendstream']);
 const xref=length;append(encode('xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
 const pdf=new Uint8Array(length);let cursor=0;for(const chunk of chunks){pdf.set(chunk,cursor);cursor+=chunk.length;}return pdf;
}

import {readFile,writeFile} from 'node:fs/promises';
const names=['package.json','run.mjs','fixture.mjs','report.mjs','启动测试.cmd','使用说明.txt'];
const files=await Promise.all(names.map(async name=>({name,data:name.endsWith('.cmd')?Buffer.from((await readFile(new URL(name,import.meta.url),'utf8')).replace(/\r?\n/g,'\r\n')):await readFile(new URL(name,import.meta.url))})));
files.push({name:'import-chart.js',data:await readFile(new URL('../../import-chart.js',import.meta.url))});
// Small uncompressed UTF-8 ZIP using standard local/central records; no build-time external tool required.
function crc32(data){let value=0xffffffff;for(const byte of data){value^=byte;for(let bit=0;bit<8;bit++)value=(value>>>1)^((value&1)?0xedb88320:0);}return (value^0xffffffff)>>>0;}
const parts=[],central=[];let offset=0;
for(const {name,data} of files){const filename=Buffer.from(name),crc=crc32(data),local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(0x21,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(filename.length,26);parts.push(local,filename,data);const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt16LE(0x21,14);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(data.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);central.push(entry,filename);offset+=local.length+filename.length+data.length;}
const index=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(index.length,12);end.writeUInt32LE(offset,16);
await writeFile(new URL('../../public/aidoucang-local-test.zip',import.meta.url),Buffer.concat([...parts,index,end]));
console.log('已生成本地AI豆仓测试包（不含账号、照片或登录资料）。');

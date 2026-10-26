import {readFile,writeFile} from 'node:fs/promises';
const read=name=>readFile(new URL(name,import.meta.url),'utf8');
const [html,css,mard,quantize,chart,app]=await Promise.all(['index.html','style.css','mard-palette.js','quantize.js','import-chart.js','app.js'].map(read));
const script=mard.replaceAll('export const ','const ').replaceAll('export function ','function ')+'\n'+quantize.replaceAll('export function ','function ')+'\n'+chart.replaceAll('export function ','function ')+'\n'+app.replace(/^import .*?;\s*/gm,'');
const output=html.replace('<link rel="stylesheet" href="/style.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="/app.js"></script>',()=>'<script>\n'+script.replace(/<\/script/gi,'<\\/script')+'\n</script>').replace('class="brand" href="/"','class="brand" href="#"');
await writeFile(new URL('豆格.html',import.meta.url),output);
console.log('已生成 豆格.html：无需服务器、无需联网，双击即可打开。');

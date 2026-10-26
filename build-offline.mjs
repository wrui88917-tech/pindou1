import './build-standalone.mjs';
import {readFile,writeFile} from 'node:fs/promises';
let html=await readFile(new URL('豆格.html',import.meta.url),'utf8');
html=html.replace('<html lang="zh-CN">','<html lang="zh-CN" data-offline="true">')
 .replace('<title>豆格 · 拼豆图纸工作室</title>','<title>豆格 · 离线试用版（含PDF导出）</title>')
 .replace('BEAD STUDIO · V4','离线试用 · 粗网格PDF版')
 .replace('● 拼豆本地处理 · AI改绘需上传照片','● 离线使用 · 照片不上传')
 .replace('<main>','<main><p class="shop-guide">离线试用版：无需登录。上传照片 → 选择店内板型 → 导出PNG或PDF。照片在本机处理；AI生图需联网服务，此版不提供。PDF含完整色号和用量，但AI豆仓导入兼容性仍需核对。</p>')
 .replace('</style>','.ai-card{display:none!important}.compat-tests details{display:none!important}</style>')
 .replace('<span class="step">03</span>','<span class="step">02</span>');
await writeFile(new URL('offline.html',import.meta.url),html);
console.log('已生成 offline.html：本地直接打开，禁用在线AI入口，包含PDF导出。');

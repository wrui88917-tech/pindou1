import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {makeFixture,fixturePalette,expected} from './fixture.mjs';
import {readDimensions,readBlankCounts,assessResult} from './report.mjs';

const home=dirname(fileURLToPath(import.meta.url)),output=join(home,'results',new Date().toISOString().replace(/[:.]/g,'-'));
const terminal=createInterface({input:stdin,output:stdout});
let context,page;
const observed={dimensions:null,blankCounts:null,colors:{},errors:null,manualSteps:[]};
const say=message=>console.log(message);
async function ask(message){await terminal.question('\n'+message+'\n完成后请回到此窗口按回车继续（Ctrl+C退出）：');}
async function text(){return page.locator('body').innerText({timeout:10000});}
async function screenshot(name){if(page&&!page.isClosed())await page.screenshot({path:join(output,name+'.png'),fullPage:true}).catch(()=>{});}
async function button(label){const byRole=page.getByRole('button',{name:label,exact:true});if(await byRole.count()===1&&await byRole.isVisible())return byRole;const byText=page.getByText(label,{exact:true});if(await byText.count()===1&&await byText.isVisible())return byText;return null;}
async function manual(message){observed.manualSteps.push(message);await screenshot('manual-'+observed.manualSteps.length);await ask(message);}
async function launch(){
 const errors=[];
 if(process.env.AIDOUCANG_BROWSER_PATH)return chromium.launchPersistentContext(join(home,'.browser-profile'),{executablePath:process.env.AIDOUCANG_BROWSER_PATH,headless:false,viewport:{width:1440,height:1000},acceptDownloads:true});
 for(const channel of ['msedge','chrome',null]){try{return await chromium.launchPersistentContext(join(home,'.browser-profile'),{...(channel?{channel}:{}),headless:false,viewport:{width:1440,height:1000},acceptDownloads:true});}catch(error){errors.push(channel||'Chromium');}}
 throw Error('无法启动 '+errors.join('/')+'。请安装Edge或Chrome；或在此目录执行 npx playwright install chromium 后重试。');
}
async function upload(path){
 const choose=await button('选择图纸');
 if(choose){
  const chooser=page.waitForEvent('filechooser',{timeout:6000}).catch(()=>null);
  await choose.click();const result=await chooser;
  if(result){await result.setFiles(path);return true;}
 }
 const inputs=page.locator('input[type=file]');
 if(await inputs.count()===1){await inputs.setInputFiles(path);return true;}
 return false;
}
async function waitForRecognition(timeout=180000){
 const end=Date.now()+timeout;let update=0;
 while(Date.now()<end){
  if(page.isClosed())throw Error('浏览器已关闭');
  const body=await text();
  const dimensions=readDimensions(body);if(dimensions)observed.dimensions=dimensions;
  if(body.includes('进入色号整理'))return 'preview';
  if(body.includes('整理色号')&&(/应识别/.test(body)||/单击选择/.test(body)))return 'arrange';
  if(Date.now()-update>15000){say('等待AI豆仓识别中……（不会自动重传或重复计费）');update=Date.now();}
  await page.waitForTimeout(1000);
 }
 return null;
}
async function readColorStates(){
 return page.evaluate(()=>{
  const result={};
  // Read only short sidebar labels with adjacent count comparison; do not save body/account data.
  for(const node of document.querySelectorAll('body *')){
   if(node.children.length||!node.getClientRects().length)continue;
   const code=node.textContent.trim();if(!/^[A-Z]\d{1,3}$/.test(code))continue;
   for(let parent=node.parentElement,depth=0;parent&&depth<5;parent=parent.parentElement,depth++){
    const value=parent.innerText?.trim()||'';if(value.length>80)break;
    const names=value.match(/\b[A-Z]\d{1,3}\b/g)||[];if(new Set(names).size>1)break;
    const match=value.match(/一致|(?:少|多)\s*\d+/);
    if(match){const state=match[0].startsWith('一致')?'一致':match[0][0];result[code]={state,...(state==='一致'?{}:{difference:Number(match[0].replace(/\D/g,''))})};break;}
   }
  }
  return result;
 });
}
async function writeReport(error){
 const result=assessResult(expected,observed);
 const report={version:1,variant:process.argv.includes('--white')?'white':'standard',createdAt:new Date().toISOString(),expected,observed,...result,...(error?{status:'incomplete',error}:{}),liveSiteTest:true};
 await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
 const words={pass:'通过',fail:'存在差异',incomplete:'未完成',unknown:'未读到'};
 await writeFile(join(output,'报告.txt'),[
  'AI豆仓图片导入测试：'+words[report.status],
  '范围：'+report.scope,
  ...report.checks.map(x=>`${x.name}：${words[x.status]}；预期 ${JSON.stringify(x.expected??'无错误')}；读数 ${JSON.stringify(x.actual)}`),
  '手动操作：'+(observed.manualSteps.join('；')||'无（登录除外）'),
  ...(error?['中断原因：'+error]:[]),
  '没有校验每颗豆的坐标；没有验证PDF。识别页面状态只是网站自身的统计对照。'
 ].join('\n'));
 say('\n结果：'+words[report.status]+'\n报告目录：'+output);
}
try{
 await mkdir(output,{recursive:true});
 say('本工具会向AI豆仓上传一张非私人测试图并发起一次识别，可能消耗该账号额度。不会保存修改、替换清单或发布作品。');
 context=await launch();page=context.pages()[0]||await context.newPage();
 // Render locally before navigating: no external requests or private photo uploads.
 const renderer=await readFile(join(home,'import-chart.js'),'utf8').catch(()=>readFile(new URL('../../import-chart.js',import.meta.url),'utf8'));
 await page.setContent('<!doctype html><title>准备12×12测试图</title>');
 await page.addScriptTag({content:renderer.replace('export function drawImportChart','function drawImportChart')});
 const fixture=makeFixture(),variant=process.argv.includes('--white')?'white':'color';
 const image=await page.evaluate(({fixture,palette,variant})=>{
  const out=document.createElement('canvas');const meta=drawImportChart(out,{...fixture,labelStyle:variant,codeFor:key=>Object.keys(palette).find(code=>palette[code].join(',')===key)});return {data:out.toDataURL('image/png'),meta};
 },{fixture,palette:fixturePalette,variant});
 if(image.meta.total!==expected.total||image.meta.empty!==expected.empty)throw Error('测试图内部数量检查失败');
 const png=join(output,'test-12x12.png');await writeFile(png,Buffer.from(image.data.split(',')[1],'base64'));
 await page.goto('https://www.aidoucang.cn/patterns',{waitUntil:'domcontentloaded',timeout:45000});
 await ask('请在打开的独立浏览器中自行登录AI豆仓。确认允许本次测试使用识别额度后，按回车开始上传。');
 await page.goto('https://www.aidoucang.cn/pattern/add?mode=image',{waitUntil:'domcontentloaded',timeout:45000});
 const tab=await button('AI智能统计');if(tab)await tab.click();
 if(!await upload(png))await manual('未找到唯一上传入口。请在浏览器选择“图纸导入 → AI智能统计”，手动选择此文件：'+png+'。只上传一次。');
 say('测试图已交给上传流程，等待识别结果。');
 let stage=await waitForRecognition();
 if(!stage){await manual('自动等待已结束。请检查浏览器是否需要操作；如果识别还在运行，请等待完成。不要修改图例或色号。');stage=await waitForRecognition(10000);}
 if(stage==='preview'){
  observed.dimensions=readDimensions(await text())||observed.dimensions;
  await screenshot('01-recognition-preview');
  const enter=await button('进入色号整理');if(enter)await enter.click();else await manual('请点击“进入色号整理”。');
  await page.waitForTimeout(1500);
 }
 if(!stage)throw Error('没有找到识别结果；报告保留为未完成，不判通过。');
 await screenshot('02-color-check');
 const body=await text();
 // At first entry the checker selects the blank group. Otherwise do not treat another color's counts as blank counts.
 const selectedBlank=await page.evaluate(()=>{const list=[...document.querySelectorAll('body *')].filter(n=>n.children.length===0&&/^1\/\d+$/.test(n.textContent.trim()));return list.some(n=>n.getClientRects().length);});
 observed.blankCounts=selectedBlank?readBlankCounts(body):null;
 observed.colors=await readColorStates();
 const errors=body.match(/(\d+)\s*色有误/);observed.errors=errors?Number(errors[1]):body.includes('全部一致')?0:null;
 await writeReport();
 await ask('读数和截图已保存。你可以在浏览器查看结果；请不要点击“替换”来掩盖差异。按回车关闭测试浏览器。');
}catch(error){
 await screenshot('error');
 // Report only bounded messages, not cookies, storage or request headers.
 const message=String(error.message||error).slice(0,1000);say('测试暂停：'+message);
 await writeReport(message).catch(()=>{});process.exitCode=1;
}finally{terminal.close();if(context)await context.close().catch(()=>{});}

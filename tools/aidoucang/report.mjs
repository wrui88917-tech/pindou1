export function readDimensions(text){
 const match=text.match(/网格\s*[:：]?\s*(\d+)\s*[×xX*]\s*(\d+)/);
 // AI豆仓识别预览的“网格”为行×列。正方形fixture不受顺序影响。
 return match?{rows:Number(match[1]),columns:Number(match[2])}:null;
}
export function readBlankCounts(text){const match=text.match(/应识别\s*(\d+)\s*个[\s\S]{0,35}?已识别\s*(\d+)\s*个/);return match?{expected:Number(match[1]),actual:Number(match[2])}:null;}
export function assessResult(expected,observed){
 const checks=[];
 checks.push({name:'网格行列',status:observed.dimensions?(observed.dimensions.columns===expected.columns&&observed.dimensions.rows===expected.rows?'pass':'fail'):'unknown',expected:{columns:expected.columns,rows:expected.rows},actual:observed.dimensions});
 checks.push({name:'空白格',status:observed.blankCounts?(observed.blankCounts.actual===expected.empty&&observed.blankCounts.expected===expected.empty?'pass':'fail'):'unknown',expected:expected.empty,actual:observed.blankCounts});
 for(const [code,count] of Object.entries(expected.colors)){const state=observed.colors?.[code];checks.push({name:code,expected:count,status:state?.state==='一致'?'pass':state?.state==='少'||state?.state==='多'?'fail':'unknown',actual:state||null,evidence:'网站图例与逐格数量的对比状态；不代表逐格坐标已校验'});}
 if(observed.errors!==null&&observed.errors!==undefined)checks.push({name:'网站色号差异',status:observed.errors===0?'pass':'fail',actual:observed.errors});
 const status=checks.some(x=>x.status==='fail')?'fail':checks.every(x=>x.status==='pass')?'pass':'incomplete';
 return {status,scope:'行列数、空白数和色号用量对照；不验证每颗豆的坐标，也不测试PDF',checks};
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {createChartPDF} from './pdf-export.js';
import {makeFixture,fixturePalette} from './tools/aidoucang/fixture.mjs';
const codeFor=key=>Object.keys(fixturePalette).find(code=>fixturePalette[code].join(',')===key);
test('vector PDF retains exact fixture code counts and explicit 12x12 metadata',()=>{const pdf=new TextDecoder().decode(createChartPDF({...makeFixture(),codeFor}));assert.ok(pdf.startsWith('%PDF-1.4'));assert.ok(pdf.includes('12x12 / 3 colors / 52 beads'));for(const [code,count] of [['H7',22],['E6',29],['H2',1]])assert.equal(pdf.split(`(${code}) Tj`).length-1,count+1);assert.ok(!pdf.includes('/Subtype /Image'));const offset=Number(pdf.match(/startxref\n(\d+)/)[1]);assert.ok(pdf.slice(offset).startsWith('xref\n'));const positions=[...pdf.matchAll(/(\d{10}) 00000 n/g)].map(match=>Number(match[1]));positions.forEach((position,i)=>assert.ok(pdf.slice(position).startsWith(`${i+1} 0 obj`)));});
test('PDF rejects oversized or malformed data and ambiguous codes',()=>{assert.throws(()=>createChartPDF({columns:120,rows:1,cells:Array(120).fill(null),codeFor}));assert.throws(()=>createChartPDF({columns:12,rows:12,cells:[],codeFor}));assert.throws(()=>createChartPDF({...makeFixture(),codeFor:()=>''}));assert.throws(()=>createChartPDF({...makeFixture(),codeFor:()=> 'A1'}));assert.throws(()=>createChartPDF({...makeFixture(),codeFor:()=> '中文'}));});
test('PDF string syntax is escaped for user-provided ASCII codes',()=>{const pdf=new TextDecoder().decode(createChartPDF({columns:1,rows:1,cells:[[10,20,30]],codeFor:()=>'(x)\\'}));assert.ok(pdf.includes('(\\(x\\)\\\\) Tj'));});

test('image-only PDF has exactly one image, no text layer, correct bytes and alpha flattening',async()=>{
 const {createImagePDF}=await import('./pdf-export.js');const {inflateSync}=await import('node:zlib');
 const bytes=await createImagePDF({width:2,height:1,rgba:new Uint8Array([241,61,116,255,0,0,0,0])}),pdf=new TextDecoder('latin1').decode(bytes);
 assert.equal((pdf.match(/\/Subtype \/Image/g)||[]).length,1);assert.ok(!pdf.includes('/Font'));assert.ok(!pdf.includes('BT'));assert.ok(pdf.includes('/Width 2 /Height 1'));
 const marker=new TextEncoder().encode('\nstream\n');let start=-1;for(let i=0;i<=bytes.length-marker.length;i++){if(marker.every((v,j)=>bytes[i+j]===v))start=i+marker.length;}const before=new TextDecoder().decode(bytes.slice(0,start)),length=Number([...before.matchAll(/\/Length (\d+)/g)].at(-1)[1]);const decoded=pdf.includes('/FlateDecode')?inflateSync(bytes.slice(start,start+length)):bytes.slice(start,start+length);assert.deepEqual([...decoded],[241,61,116,255,255,255]);
 const offset=Number(pdf.match(/startxref\n(\d+)/)[1]);assert.ok(new TextDecoder().decode(bytes.slice(offset)).startsWith('xref\n'));
});

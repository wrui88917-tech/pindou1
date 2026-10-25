import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dominantGrid,reducePalette} from './quantize.js';
test('majority wins instead of averaging and coordinates remain row-major',()=>{const data=new Uint8ClampedArray([255,0,0,255,255,0,0,255,0,0,255,255,0,255,0,255]);assert.deepEqual(dominantGrid(data,4,1,1,1),[[255,0,0]]);assert.deepEqual(dominantGrid(data,4,1,2,1),[[255,0,0],[0,0,255]]);});
test('transparent pixels use white background',()=>assert.deepEqual(dominantGrid(new Uint8ClampedArray([0,0,0,0]),1,1,1,1),[[255,255,255]]));
test('palette limit preserves number of cells and one solid RGB per cell',()=>{const result=reducePalette([[255,0,0],[0,255,0],[0,0,255],[255,0,0]],2);assert.equal(result.length,4);assert.ok(new Set(result.map(c=>c.join(','))).size<=2);assert.ok(result.every(c=>c.length===3));});

test('local color numbering is short, unique, deterministic and grouped by color',async()=>{const {suggestColorNumbers}=await import('./quantize.js');const keys=['255,0,0','255,255,255','0,0,255','0,0,0','0,255,0','128,128,128'];const labels=suggestColorNumbers(keys);assert.deepEqual([...labels.values()],['1','2','3','4','5','6']);assert.equal(labels.get('0,0,0'),'1');assert.equal(labels.get('128,128,128'),'2');assert.equal(labels.get('255,255,255'),'3');assert.equal(labels.get('255,0,0'),'4');assert.equal(labels.get('0,255,0'),'5');assert.equal(labels.get('0,0,255'),'6');assert.deepEqual([...suggestColorNumbers([...keys].reverse())],[...labels]);assert.equal(suggestColorNumbers(['255,0,0','255,0,0']).size,1);});

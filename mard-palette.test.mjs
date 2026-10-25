import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MARD_COLORS,MARD_GROUPS,compareBeadCodes,mapToBeadPalette} from './mard-palette.js';
test('MARD has exactly the requested nine contiguous families and 221 unique colours',()=>{
 assert.equal(MARD_COLORS.length,221);assert.deepEqual(MARD_GROUPS.map(g=>g.count),[26,32,29,26,24,25,21,23,15]);
 assert.equal(new Set(MARD_COLORS.map(c=>c.code)).size,221);assert.equal(new Set(MARD_COLORS.map(c=>c.rgb.join(','))).size,221);
 for(const g of MARD_GROUPS)assert.deepEqual(MARD_COLORS.filter(c=>c.code.startsWith(g.prefix)).map(c=>c.code),Array.from({length:g.count},(_,i)=>g.prefix+(i+1)));
});
test('every reference RGB maps to its own code without altering cell count',()=>{
 const cells=MARD_COLORS.map(c=>c.rgb);assert.deepEqual(mapToBeadPalette(cells,MARD_COLORS),cells);assert(cells.every(rgb=>rgb.every(v=>Number.isInteger(v)&&v>=0&&v<=255)));
});
test('code ordering is numeric within a family; extensions follow standard families',()=>{
 assert.deepEqual(['X1','M15','H7','A10','A2','B1','A1'].sort(compareBeadCodes),['A1','A2','A10','B1','H7','M15','X1']);
});
test('custom-only mapping cannot introduce other colours or change bead quantities',()=>{
 const palette=[{code:'X1',rgb:[0,0,0]},{code:'X2',rgb:[255,255,255]}];const cells=[[10,10,10],[230,230,230],[10,10,10]];
 assert.deepEqual(mapToBeadPalette(cells,palette),[[0,0,0],[255,255,255],[0,0,0]]);assert.throws(()=>mapToBeadPalette(cells,[]));
});

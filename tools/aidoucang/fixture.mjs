export const fixturePalette={H7:[0,0,0],E6:[241,61,116],H2:[254,255,255]};
export function makeFixture(){
 const lines=['............','..HH....HH..','.HEEH..HEEH.','.HEEEHHEEEH.','.HEEEEEEEEH.','..HEEEEEEH..','...HEEEEH...','....HEEH....','.....HH.....','............','............','............'];
 const cells=lines.join('').split('').map(c=>c==='.'?null:fixturePalette[c==='H'?'H7':'E6']);cells[39]=fixturePalette.H2;
 return {columns:12,rows:12,cells};
}
export const expected={columns:12,rows:12,total:52,empty:92,colors:{H7:22,E6:29,H2:1}};

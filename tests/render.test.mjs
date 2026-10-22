import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {createProject} from '../src/lib/templates.ts';
import {drawFrame} from '../src/lib/render.ts';
const require=createRequire(import.meta.url);
// The container has a globally available software canvas for isolated render tests.
// On normal machines without it the browser is the graphics renderer.
let Canvas;try{Canvas=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/skia-canvas').Canvas}catch{}
test('render engine paints a reactive frame in a software canvas', {skip:!Canvas},()=>{
  const c=new Canvas(640,360);const p=createProject();
  const amplitudes=new Uint8Array(512).fill(170);
  drawFrame(c.getContext('2d'),p.settings,p.tracks,amplitudes,2,new Map());
  const pixels=c.getContext('2d').getImageData(300,240,40,1).data;
  assert.ok(pixels.some(v=>v!==0));
  const before=c.getContext('2d').getImageData(0,0,640,360).data;
  const b=new Canvas(640,360);const other={...p.settings,primary:'#f02266',mode:'circle'};
  drawFrame(b.getContext('2d'),other,p.tracks,amplitudes,2,new Map());
  const after=b.getContext('2d').getImageData(0,0,640,360).data;
  assert.notDeepEqual(before,after);
});

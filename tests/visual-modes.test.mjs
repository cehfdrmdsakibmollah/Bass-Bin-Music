import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {createProject} from '../src/lib/templates.ts';
import {drawFrame} from '../src/lib/render.ts';
const require=createRequire(import.meta.url);
let Canvas;try{Canvas=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/skia-canvas').Canvas;}catch{}
test('all seven reactive visualization modes paint distinguishable visual content', {skip:!Canvas},()=>{
  const p=createProject(),wave=new Uint8Array(512).map((_,i)=>Math.round(Math.abs(Math.sin(i*.07)) * 250));
  const hashes=new Set();
  for(const mode of ['bars','circle','wave','particles','mirror','spiral','rings']){
    const c=new Canvas(360,200);
    drawFrame(c.getContext('2d'),{...p.settings,mode},p.tracks,wave,4,new Map());
    const data=c.getContext('2d').getImageData(70,20,230,160).data;
    let total=0;for(let i=0;i<data.length;i+=33)total=(total*31+data[i])>>>0;
    hashes.add(total);
  }
  assert.equal(hashes.size,7);
});
test('keyframed text motion produces a different frame', {skip:!Canvas},()=>{
  const p=createProject();
  const a=new Canvas(400,225),b=new Canvas(400,225);
  const spectrum=new Uint8Array(512).fill(110);
  drawFrame(a.getContext('2d'),p.settings,p.tracks,spectrum,5,new Map());
  const moved=p.tracks.map(t=>t.id==='title'?{...t,motion:{x:80,y:80,scale:1.4,rotation:28}}:t);
  drawFrame(b.getContext('2d'),p.settings,moved,spectrum,5,new Map());
  const x=a.getContext('2d').getImageData(0,0,400,225).data;
  const y=b.getContext('2d').getImageData(0,0,400,225).data;
  assert.notDeepEqual(x,y);
});
test('beat-synced Phonk effects change rendered frame at an onset, keep deterministic repeat', {skip:!Canvas},()=>{
  const p=createProject(),freq=new Uint8Array(512).fill(140);
  const map={version:1,source:'analysis',duration:6,bpm:120,confidence:1,events:[{at:2,strength:1,band:'kick',drop:true}]};
  const sync={enabled:true,style:'hard',intensity:100,offset:0,map};
  const c1=new Canvas(420,236),c2=new Canvas(420,236),c3=new Canvas(420,236);
  drawFrame(c1.getContext('2d'),p.settings,p.tracks,freq,2,new Map(),sync);
  drawFrame(c2.getContext('2d'),p.settings,p.tracks,freq,2,new Map());
  drawFrame(c3.getContext('2d'),p.settings,p.tracks,freq,2,new Map(),sync);
  const bytes=x=>x.getContext('2d').getImageData(0,0,420,236).data;
  assert.notDeepEqual(bytes(c1),bytes(c2),'kick onset must affect the actual pixel output');
  assert.deepEqual(bytes(c1),bytes(c3),'same audio timestamp must render identically in preview and export');
});
test('analog scanlines and cinematic letterbox modify captured frames deterministically', {skip:!Canvas},()=>{
  const project=createProject(),wave=new Uint8Array(512).fill(170);
  const draw=(settings)=>{const canvas=new Canvas(400,225);drawFrame(canvas.getContext('2d'),settings,project.tracks,wave,2.5,new Map());return canvas.getContext('2d').getImageData(0,0,400,225).data};
  const base=draw({...project.settings,scanlines:0,letterbox:0,chromatic:0});
  const fx={...project.settings,scanlines:65,letterbox:72,chromatic:35};
  const next=draw(fx),again=draw(fx);
  assert.notDeepEqual(base,next);
  assert.deepEqual(next,again);
});
test('maximum separate kick/drop impact never produces negative circular FX radius', {skip:!Canvas},()=>{
  const p=createProject(),c=new Canvas(320,180),data=new Uint8Array(512).fill(180);
  const sync={enabled:true,style:'cinematic',intensity:100,offset:0,kickGain:200,dropGain:200,map:{version:1,source:'manual',duration:10,bpm:120,confidence:1,events:[{at:2,strength:1,band:'kick',drop:true}]}};
  assert.doesNotThrow(()=>drawFrame(c.getContext('2d'),p.settings,p.tracks,data,2,new Map(),sync));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import {createProject,applyTemplate,templates} from '../src/lib/templates.ts';
import {moveTrack,patchTrack,normalizeProject,clampTime} from '../src/lib/project.ts';
import {dimensions,formatSeconds} from '../src/lib/media.ts';

test('default template contains versioned editable tracks',()=>{
  const project=createProject(123);
  assert.equal(project.id,'bbm-123');assert.equal(project.schemaVersion,1);
  assert.equal(project.tracks.length,3);
  assert.equal(project.settings.mode,'bars');
});
test('all template slugs are unique and each has editable settings',()=>{
  assert.equal(templates.length,16);
  assert.equal(new Set(templates.map(t=>t.slug)).size,templates.length);
  for(const t of templates){assert.equal(applyTemplate(createProject(),t.slug).settings.mode,t.mode);}
});
test('templates retain existing audio and text layers',()=>{
  const p=createProject();
  const q=applyTemplate(p,'brazilian-phonk');
  assert.equal(q.tracks.length,p.tracks.length);assert.equal(q.settings.mode,'circle');
  assert.notEqual(q.settings.primary,p.settings.primary);
});
test('track duration is clamped at end of composition',()=>{
  const p=createProject();const q=patchTrack(p,'title',{start:19,duration:20});
  assert.equal(q.tracks.find(t=>t.id==='title')?.duration,1);
  assert.equal(q.tracks.find(t=>t.id==='title')?.start,19);
});
test('track reordering and boundaries work without mutation',()=>{
  const p=createProject();const q=moveTrack(p,'title',-1);
  assert.equal(q.tracks[0].id,'title');assert.equal(p.tracks[0].id,'visualizer');
  assert.equal(moveTrack(q,'title',-1),q);
});
test('storage schema rejects unsupported versions, duration and untrusted shapes',()=>{
  const p=createProject();assert.ok(normalizeProject(p));
  assert.equal(normalizeProject({...p,schemaVersion:2}),null);
  assert.equal(normalizeProject({...p,duration:9999}),null);
  assert.equal(normalizeProject({...p,tracks:[{id:'a',kind:'unknown',start:0,duration:2}]}),null);
});
test('formatting, aspect dimensions and numeric seek clamps',()=>{
  assert.equal(formatSeconds(94),'01:34');
  assert.deepEqual(dimensions('16:9',1280),{width:1280,height:720});
  assert.deepEqual(dimensions('9:16',720),{width:720,height:1280});
  assert.deepEqual(dimensions('1:1',1080),{width:1080,height:1080});
  assert.equal(clampTime(50,20),20);assert.equal(clampTime(-1,20),0);
});

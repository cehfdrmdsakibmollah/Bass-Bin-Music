import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject} from '../src/lib/templates.ts';
import {normalizeProject} from '../src/lib/project.ts';
import {evaluateMotion,upsertKeyframe,removeKeyframe,splitTrack,snapTime,trackTransition} from '../src/lib/advanced.ts';
import {analyzePCM} from '../src/lib/audio-analysis.ts';

test('keyframe motion interpolates position, opacity, rotation and scale',()=>{
  let track=createProject().tracks.find(x=>x.id==='title');
  track=upsertKeyframe(track,0,{x:20,opacity:0,scale:.5,rotation:-90});
  track=upsertKeyframe(track,10,{x:80,opacity:1,scale:1.5,rotation:90});
  const f=evaluateMotion(track,5);
  assert.equal(f.x,50);assert.equal(f.opacity,.5);assert.equal(f.scale,1);assert.equal(f.rotation,0);
  assert.equal(evaluateMotion(track,15).x,80);
  assert.equal(removeKeyframe(track,10).keyframes.length,1);
});
test('splitting a visual clip preserves source offset and interpolated keyframes',()=>{
  let p=createProject();
  p.tracks[1]=upsertKeyframe(p.tracks[1],0,{x:10});
  p.tracks[1]=upsertKeyframe(p.tracks[1],10,{x:90});
  const out=splitTrack(p,'title',5,'new-split');
  assert.equal(out.tracks.length,4);
  const a=out.tracks.find(x=>x.id==='title'),b=out.tracks.find(x=>x.id==='new-split');
  assert.equal(a.duration,5);assert.equal(b.start,5);assert.equal(b.duration,15);
  assert.equal(b.clipStart,5);
  assert.equal(evaluateMotion(a,5).x,50);
  assert.equal(evaluateMotion(b,5).x,50);
  assert.equal(evaluateMotion(b,10).x,90);
  assert.equal(splitTrack(p,'title',0,'nope'),p);
  const trackAudio={...p.tracks[0],id:'audio',kind:'audio'};
  assert.equal(splitTrack({...p,tracks:[trackAudio]},'audio',5,'another').tracks.length,1);
});
test('timeline snapping uses nearest actual detected beat only within tolerance',()=>{
  assert.equal(snapTime(2.07,[1,2,3]),2);
  assert.equal(snapTime(2.7,[1,2,3]),2.7);
  assert.equal(snapTime(2.7,[]),2.7);
});
test('v0.1 project files remain readable; malformed keyframes and EQ are rejected',()=>{
  const p=createProject();
  assert.ok(normalizeProject(p));
  assert.equal(normalizeProject({...p,tracks:[{...p.tracks[0],motion:{x:999}}]}),null);
  assert.equal(normalizeProject({...p,tracks:[{...p.tracks[0],keyframes:[{at:40,x:10}]}]}),null);
  assert.equal(normalizeProject({...p,settings:{...p.settings,eq:{bass:99,mid:0,treble:0,compressor:false}}}),null);
  assert.ok(normalizeProject({...p,settings:{...p.settings,mode:'rings',fps:60}}));
});
test('fade & zoom transitions fade at the start and restore during the clip',()=>{
  const t={...createProject().tracks[1],transition:'fade'};
  assert.equal(trackTransition(t,t.start).opacity,0);
  assert.equal(trackTransition(t,t.start+3).opacity,1);
  assert.ok(trackTransition({...t,transition:'zoom'},t.start).scale<1);
});
test('PCM analysis returns waveform and sensible transient grid on generated synthetic bass',()=>{
  const rate=8000,duration=9,signal=new Float32Array(rate*duration);
  for(let beat=0;beat<duration*2;beat++){
    const start=Math.floor(beat*rate*.5);
    for(let i=0;i<120&&start+i<signal.length;i++)signal[start+i]=.85*Math.sin(i*.18)*Math.exp(-i/46);
  }
  const out=analyzePCM(signal,rate);
  assert.equal(out.waveform.length,160);
  assert.ok(out.peak>.4);
  assert.ok(out.beats.length>=6,`Found ${out.beats.length} transients`);
  assert.ok(out.bpm===null||(out.bpm>=70&&out.bpm<=180));
  assert.deepEqual(analyzePCM(new Float32Array(0),8000),{waveform:[],beats:[],bpm:null,duration:0,peak:0});
});

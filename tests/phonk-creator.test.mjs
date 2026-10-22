import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,applyTemplate,templates} from '../src/lib/templates.ts';
import {normalizeProject} from '../src/lib/project.ts';
import {trackTransition} from '../src/lib/advanced.ts';
import {PHONK_FX_PRESETS,applyPhonkFx} from '../src/lib/phonk-fx.ts';
import {planPhonkMashup,DEFAULT_MIX,encodePcmWav} from '../src/lib/phonk-mix.ts';

test('Avee & NCS-inspired templates use original valid visualizer modes',()=>{
 for(const slug of ['avee-bass-reactor','avee-darkwave','ncs-prism','ncs-night-ring','phonk-cobrawave','phonk-purple-shift']){
  const template=templates.find(t=>t.slug===slug);assert.ok(template,slug);
  const p=applyTemplate(createProject(1),slug);
  assert.ok(['avee','ncs','catpulse'].includes(p.settings.mode));
  assert.ok(normalizeProject(p));
 }
 assert.ok(templates.length>=22);
});
test('all curated FX presets update actual Studio settings and transitions safely',()=>{
 const p=createProject(2);
 assert.equal(PHONK_FX_PRESETS.length,10);
 for(const preset of PHONK_FX_PRESETS){
  const updated=applyPhonkFx(p,preset.id,'all');
  assert.ok(updated!==p);
  assert.equal(updated.tracks.find(t=>t.id==='title').transition,preset.transition);
  assert.ok(normalizeProject(updated),preset.id);
 }
});
test('FX selected scope never modifies other clips and rejects audio selection',()=>{
 const p=createProject(3);
 assert.equal(applyPhonkFx(p,'velocity','selected','visualizer'),p);
 const edited=applyPhonkFx(p,'velocity','selected','title');
 assert.equal(edited.tracks.find(t=>t.id==='title').transition,'whip');
 assert.equal(edited.tracks.find(t=>t.id==='visualizer').transition,undefined);
 assert.equal(applyPhonkFx(p,'missing','all'),p);
});
test('velocity / glitch / spin transitions generate deterministic animation',()=>{
 const clip={...createProject(4).tracks[1],transition:'spin'};
 const first=trackTransition(clip,.02);
 assert.ok(first.rotation<0);
 assert.ok(first.opacity<.2);
 const settled=trackTransition(clip,1);
 assert.equal(settled.rotation,0);
 assert.equal(settled.opacity,1);
 for(const kind of ['whip','glitch']){
  const frame=trackTransition({...clip,transition:kind},.05);
  assert.deepEqual(frame,trackTransition({...clip,transition:kind},.05));
  assert.ok(frame.opacity>=0&&frame.opacity<=1);
 }
});
test('phonk two-song crossfade plan honours source trims and speed',()=>{
 const m=planPhonkMashup(60,90,{...DEFAULT_MIX,aIn:10,aOut:40,bIn:20,bOut:56,speedB:1.2,crossfade:5});
 assert.equal(m.aLength,30);
 assert.equal(m.bLength,30);
 assert.equal(m.bAt,25);
 assert.equal(m.duration,55);
 assert.equal(m.overlap,5);
 assert.equal(m.bSpeed,1.2);
});
test('mashup prevents invalid/oversized output and clamps audio controls',()=>{
 assert.throws(()=>planPhonkMashup(0,90,DEFAULT_MIX),/valid audio/i);
 assert.throws(()=>planPhonkMashup(250,250,{...DEFAULT_MIX,aOut:245,bOut:245,crossfade:0}),/180 seconds/);
 const m=planPhonkMashup(5,6,{...DEFAULT_MIX,crossfade:90,volumeA:9,bassDb:50});
 assert.ok(m.overlap<=5);assert.equal(m.volumeA,1.5);assert.equal(m.bassDb,12);
});
test('exported PCM WAV contains accurate RIFF/WAVE headers and stereo samples',async()=>{
 const wav=encodePcmWav([new Float32Array([0,1,-1,.5]),new Float32Array([0,-.5,.5,1])],44100);
 const b=Buffer.from(await wav.arrayBuffer());
 assert.equal(b.toString('ascii',0,4),'RIFF');
 assert.equal(b.toString('ascii',8,12),'WAVE');
 assert.equal(b.readUInt16LE(22),2);
 assert.equal(b.readUInt32LE(24),44100);
 assert.equal(b.readUInt32LE(40),16);
 assert.equal(b.readInt16LE(46),0);
 assert.equal(b.readInt16LE(48),32767);
 assert.equal(b.readInt16LE(50),-16384);
});

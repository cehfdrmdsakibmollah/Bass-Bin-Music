import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject} from '../src/lib/templates.ts';
import {resizeComposition} from '../src/lib/shorts.ts';
import {normalizeProject} from '../src/lib/project.ts';
import {createPhonkMontage,MONTAGE_STYLES} from '../src/lib/phonk-montage.ts';

const fixture=(withBeat=true)=>{
 const p=resizeComposition(createProject(200),45);
 const tracks=[
 {id:'user-song',kind:'audio',label:'Phonk.mp3',start:0,duration:45,hidden:false,muted:false,assetId:'song',sourceDuration:45},
 {id:'car-a',kind:'video',label:'Car A',start:0,duration:45,hidden:false,muted:false,assetId:'car-1',sourceDuration:7},
 {id:'car-b',kind:'video',label:'Car B',start:0,duration:45,hidden:false,muted:false,assetId:'car-2',sourceDuration:4},
 ...p.tracks
 ];
 const events=Array.from({length:90},(_,i)=>({at:.5+i*.49,strength:i%7===0?.99:.64,band:i%2?'snare':'kick',drop:i%13===0}));
 const beatSync=withBeat?{enabled:true,style:'drift',intensity:70,offset:0,map:{version:1,source:'analysis',bpm:122,confidence:.77,duration:45,events}}:undefined;
 return {...p,tracks,beatSync};
};
test('montage requires two different visuals and real uploaded song; never fabricates visuals',()=>{
 const clean=createProject();
 const missing=createPhonkMontage(clean,'hardcut');
 assert.equal(missing.project,clean);
 assert.equal(missing.cuts,0);
 const songOnly={...clean,tracks:[...clean.tracks,{id:'music',kind:'audio',assetId:'song',hidden:false,muted:false,label:'music',start:0,duration:20}]};
 assert.match(createPhonkMontage(songOnly,'hardcut').reason,/at least two/i);
});
test('montage has three clearly different editing styles',()=>{
 assert.equal(MONTAGE_STYLES.length,3);
 assert.equal(new Set(MONTAGE_STYLES.map(s=>s.id)).size,3);
 const source=fixture();
 const originalJSON=JSON.stringify(source);
 for(const style of MONTAGE_STYLES){
   const {project,cuts,reason,usedAudioBeats}=createPhonkMontage(source,style.id);
   assert.equal(reason,undefined);
   assert.equal(usedAudioBeats,true);
   assert.ok(cuts>=2&&cuts<=42);
   assert.equal(project.template,`montage-${style.id}`);
   assert.equal(project.settings.aspect,'9:16');
   assert.equal(project.tracks.find(t=>t.id==='visualizer')?.hidden,true);
   assert.equal(project.tracks.find(t=>t.id==='user-song').assetId,'song');
   const visuals=project.tracks.filter(t=>t.id.startsWith('montage-'));
   assert.equal(visuals.length,cuts);
   assert.ok(visuals.some(t=>t.assetId==='car-1')&&visuals.some(t=>t.assetId==='car-2'));
   assert.ok(visuals.every(t=>t.keyframes.length>=2&&t.duration>=.1));
   assert.ok(normalizeProject(project),'normalized '+style.id);
 }
 assert.equal(JSON.stringify(source),originalJSON);
});
test('montage never adds gaps, reuses source offsets within duration and stays under layer limits',()=>{
 const {project}=createPhonkMontage(fixture(),'hardcut');
 const shots=project.tracks.filter(t=>t.id.startsWith('montage-')).sort((a,b)=>a.start-b.start);
 assert.equal(shots[0].start,0);
 assert.ok(Math.abs(shots.at(-1).start+shots.at(-1).duration-project.duration)<.01);
 for(let i=1;i<shots.length;i++)assert.ok(Math.abs(shots[i].start-(shots[i-1].start+shots[i-1].duration))<.01);
 for(const shot of shots){assert.ok((shot.clipStart||0)>=0);assert.ok(shot.clipStart<shot.sourceDuration);}
 assert.ok(project.tracks.length<=80);
});
test('without analyzable beats, montage uses honest fixed-pacing fallback',()=>{
 const result=createPhonkMontage(fixture(false),'memphis');
 assert.ok(result.cuts>=2);
 assert.equal(result.usedAudioBeats,false);
 assert.ok(normalizeProject(result.project));
});

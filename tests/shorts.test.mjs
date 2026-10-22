import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject} from '../src/lib/templates.ts';
import {normalizeProject} from '../src/lib/project.ts';
import {suggestHooks,applyShortHook,resizeComposition,splitAudioSegment,joinNextAudio,trimAudioSegment,restartPosition} from '../src/lib/shorts.ts';

const makeSong=(seconds=135)=>{
  const base=resizeComposition(createProject(100),seconds);
  const events=Array.from({length:200},(_,i)=>({at:i*.55,strength:i%9===0?.93:.6,band:i%2===0?'kick':'snare',drop:i%26===0}));
  const map={version:1,source:'analysis',bpm:109,confidence:.7,duration:seconds,events};
  const tracks=[{id:'audio-x',kind:'audio',start:0,duration:seconds,label:'Sample music',assetId:'source.wav',hidden:false,muted:false,sourceDuration:seconds},...base.tracks];
  return {...base,tracks,beatSync:{enabled:true,style:'drift',intensity:70,offset:0,map}};
};
test('long imported song expands timeline and background beyond former 20s cap',()=>{
 const project=resizeComposition(createProject(1),235);
 assert.equal(project.duration,235);
 assert.equal(project.tracks.find(t=>t.id==='visualizer')?.duration,235);
 assert.ok(normalizeProject(project));
 assert.equal(resizeComposition(project,999).duration,600);
});
test('suggested hook windows are source-bounded, ranked and non-overlapping',()=>{
 const p=makeSong();
 const before=JSON.stringify(p);
 const picks=suggestHooks(p.beatSync.map,135,15);
 assert.ok(picks.length>=2);
 for(const h of picks){assert.ok(h.start>=0);assert.ok(h.end<=135);assert.equal(h.length,15);}
 assert.ok(picks[0].score>=picks[1].score);
 assert.equal(JSON.stringify(p),before);
});
test('silence produces low confidence fallback, no fake hit',()=>{
 const map={version:1,source:'analysis',bpm:null,confidence:0,duration:30,events:[]};
 const h=suggestHooks(map,30,15);
 assert.equal(h[0].score,0);assert.match(h[0].reason,/low confidence/i);
});
test('one-click short changes aspect without destroying original full source beat map',()=>{
 const p=makeSong();
 const q=applyShortHook(p,'source.wav',28,58,p.beatSync.map);
 assert.equal(q.duration,30);assert.equal(q.settings.aspect,'9:16');
 assert.equal(q.tracks.find(t=>t.kind==='audio')?.clipStart,28);
 assert.equal(q.tracks.find(t=>t.kind==='audio')?.duration,30);
 assert.equal(q.tracks.find(t=>t.id==='visualizer')?.duration,30);
 assert.ok(q.beatSync.map.events.every(t=>t.at>=0&&t.at<=30));
 assert.equal(p.duration,135);assert.equal(p.beatSync.map.events[0].at,0);
 assert.ok(normalizeProject(q));
});
test('audio can be split into source-contiguous pieces then rejoined',()=>{
 const p=makeSong(120);
 const q=splitAudioSegment(p,'audio-x',27.5,'audio-2');
 const clips=q.tracks.filter(t=>t.kind==='audio');
 assert.equal(clips.length,2);assert.equal(clips[1].start,27.5);
 assert.equal(clips[1].clipStart,27.5);assert.equal(clips[1].duration,92.5);
 const joined=joinNextAudio(q,'audio-x');
 assert.equal(joined.tracks.filter(t=>t.kind==='audio').length,1);
 assert.equal(joined.tracks.find(t=>t.id==='audio-x').duration,120);
 assert.ok(normalizeProject(joined));
});
test('joining discontinuous audio keeps two separately-editable segments',()=>{
 const p=makeSong(120);
 const split=splitAudioSegment(p,'audio-x',40,'audio-2');
 const reordered={...split,tracks:split.tracks.map(t=>t.id==='audio-2'?{...t,start:60,clipStart:75,duration:40}:t)};
 const joined=joinNextAudio(reordered,'audio-x');
 assert.equal(joined.tracks.filter(t=>t.kind==='audio').length,2);
 assert.equal(joined.tracks.find(t=>t.id==='audio-2').start,40);
 assert.equal(joined.tracks.find(t=>t.id==='audio-2').clipStart,75);
 assert.ok(normalizeProject(joined));
});
test('manual trim rejects bad source bounds and retains original project',()=>{
 const p=makeSong(120),q=trimAudioSegment(p,'audio-x',15,35);
 assert.equal(q.tracks[0].clipStart,15);assert.equal(q.tracks[0].duration,20);
 assert.equal(trimAudioSegment(p,'audio-x',130,145),p);
 assert.ok(normalizeProject(q));
});
test('end of song and numeric boundary reset reliably for play again',()=>{
 assert.equal(restartPosition(20,20),0);
 assert.equal(restartPosition(19.99,20),0);
 assert.equal(restartPosition(19,20),19);
 assert.equal(restartPosition(Number.NaN,20),0);
 assert.equal(restartPosition(0,20),0);
});

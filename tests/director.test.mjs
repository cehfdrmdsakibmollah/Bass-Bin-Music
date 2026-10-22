import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject} from '../src/lib/templates.ts';
import {normalizeProject} from '../src/lib/project.ts';
import {generateTempoGrid} from '../src/lib/beat-sync.ts';
import {analyzeArrangement,autoDirector,generateMotion,quantizeBeatMap,quantizeTimeline,rippleMove,captionsSRT,editDecisionCSV,audioGainAt} from '../src/lib/director.ts';
const make=()=>{
  const p=createProject();p.duration=12;p.tracks=p.tracks.map(t=>({...t,duration:12}));
  p.beatSync={enabled:true,style:'hard',intensity:80,offset:0,map:generateTempoGrid(12,120)};
  p.tracks.push({id:'source-a',kind:'image',label:'JDM, neon',assetId:'image-1',start:0,duration:12,muted:false,hidden:false});
  p.tracks.push({id:'source-b',kind:'video',label:'Drift car',assetId:'video-1',start:0,duration:12,clipStart:3,muted:true,hidden:false});
  return p;
};
test('section analyzer labels rhythm phrase and returns bounded non-overlapping ordered windows',()=>{
  const p=make();p.beatSync.map.events[8].drop=true;
  const arr=analyzeArrangement(p,1);
  assert.ok(arr.length>1);assert.equal(arr[0].start,0);assert.equal(arr.at(-1).end,12);
  assert.ok(arr.some(s=>s.label==='drop'));
  assert.ok(arr.every((s,i)=>s.start>=0&&s.end<=12&&(i===0||s.start===arr[i-1].end)));
  assert.deepEqual(analyzeArrangement({...p,beatSync:undefined}),[]);
});
test('Auto Director generates editable cuts and keyframes but retains audio, text and visualizer',()=>{
  const p=make();p.tracks.push({id:'audio',kind:'audio',label:'Source audio',assetId:'song',start:0,duration:12,hidden:false,muted:false});
  const edit=autoDirector(p,{beatsPerCut:2,transition:'zoom',motion:'punch',focus:'all',minStrength:.1,maxClips:20});
  assert.notEqual(edit,p);assert.ok(edit.tracks.some(t=>t.id==='audio'));
  assert.ok(edit.tracks.some(t=>t.kind==='visualizer'));
  const clips=edit.tracks.filter(t=>t.id.startsWith('director-'));
  assert.ok(clips.length>3);assert.ok(clips.every(t=>t.keyframes.length>=3));
  assert.ok(clips.every(t=>t.duration>=.1));
  assert.equal(clips.at(-1).start+clips.at(-1).duration,p.duration);
  assert.ok(normalizeProject(JSON.parse(JSON.stringify(edit))));
  assert.equal(p.tracks.find(t=>t.id==='source-a').start,0);
});
test('Auto Director rejects unsuitable footage or beats and respects available layer slots',()=>{
  const p=make();const options={beatsPerCut:1,transition:'fade',motion:'drift',focus:'kick',minStrength:.2,maxClips:80};
  assert.equal(autoDirector({...p,beatSync:undefined},options).tracks,p.tracks);
  assert.equal(autoDirector({...p,tracks:p.tracks.filter(t=>t.kind!=='image'&&t.kind!=='video')},options).tracks.length,p.tracks.length-2);
  const almostFull={...p,tracks:[...p.tracks,...Array.from({length:75},(_,i)=>({id:'t'+i,kind:'text',label:'text',start:0,duration:12,hidden:false,muted:false}))]};
  const edited=autoDirector(almostFull,options);
  assert.ok(edited.tracks.length<=80,'Automatic planning respects layer limit');
});
test('motion recipes are bounded by clip local time and can be serialized',()=>{
  const p=make(),t=p.tracks.find(t=>t.kind==='image');
  for(const motion of ['punch','drift','orbit','glide','none']){
    const animated=generateMotion(t,motion,80);
    assert.ok(animated.keyframes===undefined||animated.keyframes.length<=80);
    assert.ok((animated.keyframes||[]).every(k=>k.at>=0&&k.at<=t.duration));
    assert.ok(normalizeProject({...p,tracks:p.tracks.map(x=>x.id===t.id?animated:x)}));
  }
});
test('quantizer snaps edits to manual rhythmic fractions, retaining drops and strengthening collisions',()=>{
  const p=make();const map={...p.beatSync.map,events:[
    {at:.24,strength:.4,band:'kick',drop:false},
    {at:.255,strength:.9,band:'snare',drop:true},
    {at:.77,strength:.7,band:'hat',drop:false}
  ]};
  const quant=quantizeBeatMap(map,2,0);
  assert.deepEqual(quant.events.map(e=>e.at),[.25,.75]);
  assert.equal(quant.events[0].drop,true);assert.equal(quant.events[0].band,'snare');
  const withoutTempo={...map,bpm:null};assert.equal(quantizeBeatMap(withoutTempo,4),withoutTempo);
});
test('timeline snapping is non-destructive and checks bounds',()=>{
  const p=make();p.tracks.find(t=>t.id==='source-a').start=.46;p.tracks.find(t=>t.id==='source-a').duration=4;
  const updated=quantizeTimeline(p,'selected','source-a',.25);
  assert.equal(updated.tracks.find(t=>t.id==='source-a').start,.5);
  assert.equal(p.tracks.find(t=>t.id==='source-a').start,.46);
  const failed=quantizeTimeline(p,'selected','missing');assert.equal(failed,p);
});
test('ripple move moves later visuals but not audio, and rejects out-of-range edits',()=>{
  const p=make();p.tracks.find(t=>t.id==='source-a').duration=3;
  p.tracks.find(t=>t.id==='source-b').start=4;p.tracks.find(t=>t.id==='source-b').duration=3;
  p.tracks.push({id:'audio',kind:'audio',label:'Beat',start:0,duration:12,hidden:false,muted:false});
  const shifted=rippleMove(p,'source-a',1);
  assert.equal(shifted.tracks.find(t=>t.id==='source-a').start,1);
  assert.equal(shifted.tracks.find(t=>t.id==='source-b').start,5);
  assert.equal(shifted.tracks.find(t=>t.id==='audio').start,0);
  assert.equal(rippleMove(p,'source-a',11),p);
  assert.ok(normalizeProject(shifted));
});
test('subtitle SRT and interchange-friendly edit list CSV contain correct timings, escaped labels',()=>{
  const p=make();p.tracks.push({id:'sub',kind:'text',label:'Caption',text:'MIDNIGHT\nDRIFT',start:1.25,duration:2.5,hidden:false,muted:false});
  const srt=captionsSRT(p);assert.match(srt,/00:00:01,250 --> 00:00:03,750/);assert.match(srt,/MIDNIGHT\nDRIFT/);
  const csv=editDecisionCSV(p);assert.ok(csv.includes('"JDM, neon"'));assert.match(csv,/"Source In","Playback Rate"/);
  assert.equal(captionsSRT({...p,tracks:p.tracks.filter(t=>t.kind!=='text')}),'');
});
test('audio fades are applied to audible gain, disallow output outside the clip',()=>{
  const t={id:'a',kind:'audio',label:'Music',start:2,duration:8,hidden:false,muted:false,volume:1.4,fadeIn:2,fadeOut:2};
  assert.equal(audioGainAt(t,1.9),0);assert.equal(audioGainAt(t,2),0);
  assert.equal(audioGainAt(t,3),.7);assert.equal(audioGainAt(t,6),1.4);
  assert.equal(audioGainAt(t,9),.7);assert.equal(audioGainAt(t,10),0);
  assert.equal(audioGainAt({...t,muted:true},6),0);
});
test('extra cinematic and clip properties validate; malformed project is rejected',()=>{
  const p=make();p.settings={...p.settings,scanlines:50,chromatic:20,letterbox:30};
  p.tracks.find(t=>t.kind==='video').playbackRate=2.5;
  p.tracks.find(t=>t.kind==='image').flipX=true;
  p.tracks.find(t=>t.kind==='image').fadeIn=1.2;
  assert.ok(normalizeProject(JSON.parse(JSON.stringify(p))));
  assert.equal(normalizeProject({...p,settings:{...p.settings,scanlines:150}}),null);
  assert.equal(normalizeProject({...p,tracks:p.tracks.map(t=>({...t,playbackRate:-1}))}),null);
});
test('granular kick/snare/drop trigger mix scales music-to-video impact safely',async()=>{
  const {beatEnvelope}=await import('../src/lib/beat-sync.ts');
  const p=make();p.beatSync.map.events[0].drop=true;
  const origin=beatEnvelope(p.beatSync,0);
  const boosted={...p.beatSync,kickGain:150,dropGain:180};
  assert.ok(beatEnvelope(boosted,0).pulse>origin.pulse);
  assert.ok(beatEnvelope(boosted,0).drop>origin.drop);
  const off={...p.beatSync,kickGain:0,dropGain:0};
  assert.equal(beatEnvelope(off,0).pulse,0);
  assert.ok(normalizeProject({...p,beatSync:boosted}));
  assert.equal(normalizeProject({...p,beatSync:{...boosted,hatGain:400}}),null);
});
test('split video honors speed-adjusted source offset and 0% quantization preserves input',async()=>{
  const {splitTrack}=await import('../src/lib/advanced.ts');
  const p=make();p.tracks.find(t=>t.id==='source-b').playbackRate=2;
  const result=splitTrack(p,'source-b',4,'video-split');
  assert.equal(result.tracks.find(t=>t.id==='video-split').clipStart,11);
  assert.ok(normalizeProject(result));
  assert.equal(quantizeBeatMap(p.beatSync.map,4,0,0),p.beatSync.map);
});
test('motion recipe clamps extreme but valid source transform to project-safe bounds',()=>{
  const p=make(),video=p.tracks.find(t=>t.id==='source-b');
  const extreme={...video,motion:{x:100,y:100,scale:5,rotation:360,opacity:1}};
  const prepared=generateMotion(extreme,'punch',100);
  assert.ok(prepared.keyframes.every(k=>(k.scale??1)<=5&&(k.rotation??0)<=360));
  assert.ok(normalizeProject({...p,tracks:p.tracks.map(t=>t.id===extreme.id?prepared:t)}));
});
test('edit list safely quotes comma, quotes and formula-looking filenames',()=>{
  const p=make();p.tracks.find(t=>t.kind==='image').label='=1+1, "sample"';
  const csv=editDecisionCSV(p);
  assert.ok(csv.includes('"\'=1+1, ""sample"""'));
});

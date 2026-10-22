import test from 'node:test';
import assert from 'node:assert/strict';
import {detectBeats,addManualBeat,removeNearestBeat,nudgeBeatMap,beatEnvelope,autoMontage,addDropTitles,alignedBeats,emptyMap} from '../src/lib/beat-sync.ts';
import {createProject} from '../src/lib/templates.ts';
import {normalizeProject} from '../src/lib/project.ts';

function beatFixture(){
  const rate=8000,duration=12,pcm=new Float32Array(rate*duration);
  for(let b=0;b<duration*2;b++){
    const start=Math.floor(rate*(.24+b*.5));
    for(let i=0;i<320&&start+i<pcm.length;i++){
      pcm[start+i]+=(b%4===0?.97:.60)*Math.sin(i*.115)*Math.exp(-i/80);
    }
  }
  return {pcm,rate};
}
const expectedMap={version:1,source:'analysis',duration:10,bpm:120,confidence:.7,events:[
  {at:1,strength:1,band:'kick',drop:false},{at:1.5,strength:.9,band:'snare',drop:false},
  {at:2,strength:1,band:'kick',drop:true},{at:2.5,strength:.9,band:'snare',drop:false},
  {at:3,strength:1,band:'kick',drop:false},{at:3.5,strength:.8,band:'snare',drop:false},
  {at:4,strength:1,band:'kick',drop:true}
]};
const sync={enabled:true,style:'hard',intensity:100,offset:0,map:expectedMap};
test('detectBeats local PCM finds a usable onset rhythm for synthetic phonk drums',()=>{
  const {pcm,rate}=beatFixture();const result=detectBeats(pcm,rate);
  assert.ok(result.events.length>=12,`expected >12, found ${result.events.length}`);
  assert.ok(result.events.some(e=>e.band==='kick'));
  assert.ok(result.events.every((e,i)=>i===0||result.events[i-1].at<=e.at));
  assert.ok(result.events.every(e=>e.strength>=0&&e.strength<=1));
  assert.ok(result.bpm===null||(result.bpm>=65&&result.bpm<=190));
  assert.equal(detectBeats(new Float32Array(8000),8000).events.length,0);
});
test('beat triggers timed camera/flash envelope, never runs before time window or when disabled',()=>{
  const at=beatEnvelope(sync,2);assert.ok(at.pulse>.5);assert.ok(at.drop>.3);
  assert.equal(beatEnvelope(sync,2.9).pulse,0);
  assert.equal(beatEnvelope({...sync,enabled:false},2).pulse,0);
  assert.ok(beatEnvelope({...sync,offset:.1},2.1).pulse>.5);
});
test('beat markers support adding, removing and nudging without corrupting originals',()=>{
  let map=emptyMap(12);map=addManualBeat(map,2.5);map=addManualBeat(map,3);
  assert.deepEqual(map.events.map(e=>e.at),[2.5,3]);
  assert.equal(addManualBeat(map,-1),map);
  assert.equal(addManualBeat(map,2.53).events.length,2);
  assert.deepEqual(nudgeBeatMap(map,.02).events.map(e=>e.at),[2.52,3.02]);
  assert.deepEqual(removeNearestBeat(map,2.51).events.map(e=>e.at),[3]);
  assert.equal(removeNearestBeat(map,7),map);
});
test('auto-montage splits existing art on music beats without editing audio, and is capped',()=>{
  const base=createProject();base.duration=5;
  base.tracks=base.tracks.map(t=>({...t,duration:5}));
  const audio={id:'song',label:'my song',kind:'audio',assetId:'song-1',hidden:false,muted:false,start:0,duration:5};
  const visual={id:'photo1',label:'Neon car',kind:'image',assetId:'image1',hidden:false,muted:false,start:0,duration:5};
  const film={id:'film1',label:'Night drive',kind:'video',assetId:'video1',hidden:false,muted:false,start:0,duration:5};
  base.tracks.push(audio,visual,film);base.beatSync=sync;
  const changed=autoMontage(base,{beatsPerCut:1,transition:'zoom',maxClips:5});
  assert.notEqual(changed,base);
  assert.ok(changed.tracks.some(t=>t.kind==='audio'&&t.assetId==='song-1'));
  assert.equal(changed.tracks.filter(t=>t.id.startsWith('montage-')).length,5);
  assert.ok(changed.tracks.every(t=>t.kind!=='image'&&t.kind!=='video'||t.start>=0));
  assert.equal(changed.tracks.at(-1).start+changed.tracks.at(-1).duration,base.duration);
  assert.ok(normalizeProject(changed),'auto-generated montage serializes safely');
});
test('drops create editable text overlays; optional timing map survives JSON and invalid beats rejected',()=>{
  const p=createProject();p.beatSync=sync;
  const titles=addDropTitles(p,'PHONK DROP');
  assert.equal(titles.tracks.length,p.tracks.length+2);
  assert.ok(titles.tracks.filter(t=>t.id.startsWith('drop-title')).every(t=>t.text==='PHONK DROP'));
  assert.ok(normalizeProject(JSON.parse(JSON.stringify(titles))));
  assert.equal(normalizeProject({...p,beatSync:{...sync,map:{...expectedMap,events:[{at:NaN,strength:1,band:'kick',drop:true}]}}}),null);
  assert.equal(alignedBeats({...sync,offset:.2},2).at(-1).at,1.7);
});

test('manual BPM grid can be aligned to a playhead; CSV export has exact timestamps',async()=>{
  const {generateTempoGrid,beatMarkersCSV}=await import('../src/lib/beat-sync.ts');
  const grid=generateTempoGrid(4,120,.25);
  assert.deepEqual(grid.events.map(e=>e.at),[.25,.75,1.25,1.75,2.25,2.75,3.25,3.75]);
  assert.equal(grid.bpm,120);
  assert.equal(generateTempoGrid(8,-1).events.length,0);
  const csv=beatMarkersCSV({...sync,map:grid},4);
  assert.ok(csv.includes('0.250,kick,1.000,No'));
  assert.ok(csv.includes('0.750,snare,0.750,No'));
});

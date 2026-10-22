/** Deterministic, fully offline arrangement assistant for beat-aligned phonk edits.
 * It edits project metadata, never modifies media files. Markers are estimates.
 */
import type {MotionKeyframe,StudioProject,Track,Transition} from './types.ts';
import {alignedBeats,type BeatBand,type BeatEvent,type BeatMap} from './beat-sync.ts';
import {snapTime} from './advanced.ts';
const round=(n:number)=>Math.round(n*1000)/1000;
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
export type MotionPreset='punch'|'drift'|'orbit'|'glide'|'none';
export type SceneEnergy='intro'|'breakdown'|'build'|'drop'|'outro'|'groove';
export type ArrangementSection={start:number;end:number;energy:number;label:SceneEnergy;beats:number;drops:number};
export type DirectorOptions={beatsPerCut:1|2|4|8;transition:Transition;motion:MotionPreset;focus:'all'|BeatBand;minStrength:number;maxClips:number};

/** Compute meaningful sections from beat events without pretending to transcribe a song. */
export function analyzeArrangement(project:StudioProject,bars=4):ArrangementSection[]{
  const duration=project.duration;
  const beats=alignedBeats(project.beatSync,duration);
  if(!beats.length)return [];
  const bpm=project.beatSync?.map.bpm;
  const span=bpm&&bpm>0?clamp((bars*4*60)/bpm,2,24):clamp(duration/6,2,16);
  const slices:ArrangementSection[]=[];
  for(let start=0;start<duration-.001;start+=span){
    const end=Math.min(duration,start+span);
    const group=beats.filter(e=>e.at>=start&&e.at<end);
    const drops=group.filter(e=>e.drop).length;
    const energy=round(group.reduce((s,e)=>s+e.strength*(e.band==='kick'?1.3:1),0)/Math.max(1,span));
    slices.push({start:round(start),end:round(end),energy,beats:group.length,drops,label:'groove'});
  }
  const nonempty=slices.filter(s=>s.beats>0).map(s=>s.energy).sort((a,b)=>a-b);
  const median=nonempty[Math.floor(nonempty.length/2)]||.1;
  for(let i=0;i<slices.length;i++){
    const section=slices[i],next=slices[i+1];
    section.label=section.drops>0?'drop':
      section.start<duration*.12?'intro':
      section.end>duration*.92?'outro':
      section.energy<median*.48?'breakdown':
      next&&next.energy>section.energy*1.38?'build':'groove';
  }
  return slices;
}

/** Place clip-local, sparse, bounded keyframes using a named movement recipe. */
export function generateMotion(track:Track,preset:MotionPreset,strength=75):Track {
  if(preset==='none'||track.kind==='audio'||track.duration<.12)return track;
  const d=track.duration,amp=clamp(strength,0,100)/100;
  const base={x:50,y:50,scale:1,rotation:0,opacity:1,...track.motion};
  const at=(fraction:number)=>round(d*fraction);
  let keyframes:MotionKeyframe[]=[];
  if(preset==='punch')keyframes=[
    {at:0,scale:base.scale*(1+.22*amp),rotation:base.rotation-2*amp,opacity:.76},
    {at:at(.16),scale:base.scale*(1-.018*amp),rotation:base.rotation,opacity:1},
    {at:at(.42),scale:base.scale*(1+.04*amp),rotation:base.rotation+1*amp},
    {at:d,scale:base.scale,rotation:base.rotation,opacity:1}
  ];
  if(preset==='drift')keyframes=[
    {at:0,x:clamp(base.x-6*amp,0,100),y:clamp(base.y+3*amp,0,100),scale:base.scale*(1+.09*amp),rotation:base.rotation-3*amp},
    {at:at(.5),x:base.x,y:base.y,scale:base.scale*(1+.16*amp),rotation:base.rotation},
    {at:d,x:clamp(base.x+6*amp,0,100),y:clamp(base.y-3*amp,0,100),scale:base.scale*(1+.10*amp),rotation:base.rotation+3*amp}
  ];
  if(preset==='orbit')keyframes=[
    {at:0,x:clamp(base.x-5*amp,0,100),y:base.y,rotation:base.rotation-5*amp,scale:base.scale},
    {at:at(.33),x:base.x,y:clamp(base.y-5*amp,0,100),rotation:base.rotation+2*amp,scale:base.scale*(1+.08*amp)},
    {at:at(.66),x:clamp(base.x+5*amp,0,100),y:base.y,rotation:base.rotation+5*amp,scale:base.scale},
    {at:d,x:base.x,y:clamp(base.y+4*amp,0,100),rotation:base.rotation-3*amp,scale:base.scale}
  ];
  if(preset==='glide')keyframes=[
    {at:0,x:clamp(base.x-9*amp,0,100),scale:base.scale*(1+.04*amp),opacity:0},
    {at:at(.22),x:base.x,scale:base.scale,opacity:1},
    {at:at(.76),x:base.x,scale:base.scale,opacity:1},
    {at:d,x:clamp(base.x+7*amp,0,100),scale:base.scale*(1+.05*amp),opacity:0}
  ];
  // Consistent timeline duration bounds and project validation limits.
  return {...track,keyframes:keyframes.map(k=>({
    ...k,at:round(clamp(k.at,0,d)),
    ...(k.scale===undefined?{}:{scale:clamp(k.scale,.1,5)}),
    ...(k.rotation===undefined?{}:{rotation:clamp(k.rotation,-360,360)}),
    ...(k.opacity===undefined?{}:{opacity:clamp(k.opacity,0,1)})
  }))};
}

/** Arrange user supplied imagery to strongest kick/snare/hat markers, rotating shots.
 * Does not touch user audio, text, other effects or original asset blobs.
 */
export function autoDirector(project:StudioProject,options:DirectorOptions):StudioProject {
  const visuals=project.tracks.filter(t=>['image','video'].includes(t.kind)&&t.assetId&&!t.hidden);
  if(!visuals.length||!project.beatSync?.map.events.length)return project;
  const filtered=alignedBeats(project.beatSync,project.duration).filter(e=>(options.focus==='all'||e.band===options.focus)&&e.strength>=options.minStrength);
  if(filtered.length<2)return project;
  const cuts=filtered.filter((_,i)=>i%options.beatsPerCut===0);
  const points=[0,...cuts.map(e=>e.at),project.duration].filter(n=>Number.isFinite(n)&&n>=0&&n<=project.duration).sort((a,b)=>a-b);
  const valid=[0];for(const point of points)if(point-valid[valid.length-1]>=.18)valid.push(round(point));
  if(project.duration-valid[valid.length-1]<.18)valid[valid.length-1]=project.duration;
  else valid.push(project.duration);
  const protectedTracks=project.tracks.filter(t=>t.kind!=='image'&&t.kind!=='video');
  const capacity=clamp(Math.floor(options.maxClips),0,80-protectedTracks.length);
  if(capacity<2)return project;
  const segments:Track[]=[];
  for(let i=0;i<valid.length-1&&segments.length<capacity;i++){
    const start=valid[i],end=valid[i+1];if(end-start<.1)continue;
    const source=visuals[segments.length%visuals.length];
    const track:Track={...source,id:`director-${i}-${source.id}`,label:`Sync ${segments.length+1} · ${source.label}`,
      start,duration:round(end-start),clipStart:source.kind==='video'?(source.clipStart||0):0,
      transition:options.transition,motion:{x:50,y:50,scale:1,rotation:0,opacity:1},keyframes:[]};
    segments.push(generateMotion(track,options.motion,Math.round(50+options.minStrength*40)));
  }
  if(segments.length<2)return project;
  // Keep a continuous ending even when a clip cap was reached.
  const last=segments.at(-1)!;
  if(Math.abs(last.start+last.duration-project.duration)>.001){last.duration=round(project.duration-last.start);segments[segments.length-1]=generateMotion({...last,keyframes:[]},options.motion);}
  return {...project,tracks:[...protectedTracks,...segments],updatedAt:Date.now()};
}

/** Quantize independently editable user markers onto a BPM subdivision, merging collisions. */
export function quantizeBeatMap(map:BeatMap,subdivision:1|2|4,anchor=0,strength=1):BeatMap {
  if(!map.bpm||!Number.isFinite(anchor)||!Number.isFinite(strength)||strength<0||strength>1||strength===0)return map;
  const step=60/map.bpm/subdivision;
  const events:BeatEvent[]=[];
  for(const e of map.events){
    const snapped=anchor+Math.round((e.at-anchor)/step)*step;
    const at=round(clamp(e.at+(snapped-e.at)*strength,0,map.duration));
    const old=events.find(x=>Math.abs(x.at-at)<.055);
    if(old){old.drop=old.drop||e.drop;if(e.strength>old.strength){old.strength=e.strength;old.band=e.band;}}
    else events.push({...e,at});
  }
  events.sort((a,b)=>a.at-b.at);
  return {...map,source:'manual',events};
}

/** Safely snap a selected clip or every editable non-background clip to beat markers. */
export function quantizeTimeline(project:StudioProject,scope:'selected'|'all',id?:string,tolerance=.23):StudioProject {
  const beats=alignedBeats(project.beatSync,project.duration).map(e=>e.at);
  if(!beats.length)return project;
  let changed=false;
  const tracks=project.tracks.map(track=>{
    if((scope==='selected'&&track.id!==id)||(scope==='all'&&(track.kind==='audio'||track.kind==='visualizer'||track.kind==='effect')))return track;
    const start=snapTime(track.start,beats,tolerance);
    const capped=round(clamp(start,0,project.duration-track.duration));
    if(Math.abs(track.start-capped)<.0005)return track;
    changed=true;return {...track,start:capped};
  });
  return changed?{...project,tracks,updatedAt:Date.now()}:project;
}

/** Ripple-move subsequent non-background visual/text clips (audio remains where it was). */
export function rippleMove(project:StudioProject,id:string,delta:number):StudioProject {
  if(!Number.isFinite(delta)||Math.abs(delta)>project.duration)return project;
  const selected=project.tracks.find(t=>t.id===id);
  if(!selected||!['video','image','text'].includes(selected.kind))return project;
  const affected=project.tracks.filter(t=>['video','image','text'].includes(t.kind)&&
    (t.id===id||(t.start>=selected.start-.001&&t.duration<project.duration-.001)));
  if(affected.some(t=>t.start+delta<0||t.start+t.duration+delta>project.duration))return project;
  if(Math.abs(delta)<.001)return project;
  const ids=new Set(affected.map(t=>t.id));
  return {...project,updatedAt:Date.now(),tracks:project.tracks.map(t=>ids.has(t.id)?{...t,start:round(t.start+delta)}:t)};
}

/** Closed captions follow edited text-layer in/out time (external SRT file). */
function stamp(seconds:number):string {
  const ms=Math.round(Math.max(0,seconds)*1000);
  const h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;
}
export function captionsSRT(project:StudioProject):string {
  const captions=project.tracks.filter(t=>t.kind==='text'&&!t.hidden&&t.text?.trim()).sort((a,b)=>a.start-b.start);
  return captions.map((t,i)=>`${i+1}\r\n${stamp(t.start)} --> ${stamp(Math.min(project.duration,t.start+t.duration))}\r\n${t.text!.replace(/<[^>]*>/g,'').slice(0,100).trim()}\r\n`).join('\r\n');
}
const csv=(v:unknown)=>{const raw=String(v??'');const safe=/^[=+\-@\t\r]/.test(raw)?'\''+raw:raw;return `"${safe.replaceAll('"','""')}"`;};
export function editDecisionCSV(project:StudioProject):string {
  const header=['Layer','Type','Asset','Timeline In','Timeline Out','Source In','Playback Rate','Transition','Keyframes'];
  const rows=project.tracks.filter(t=>!t.hidden).sort((a,b)=>a.start-b.start).map(t=>[
    t.label,t.kind,t.assetId||'',t.start.toFixed(3),(t.start+t.duration).toFixed(3),
    (t.clipStart||0).toFixed(3),(t.playbackRate||1).toFixed(2),t.transition||'none',(t.keyframes?.length||0)
  ]);
  return [header,...rows].map(row=>row.map(csv).join(',')).join('\r\n')+'\r\n';
}
/** Audio fade envelope is applied to monitor and capture audio gain at playback time. */
export function audioGainAt(track:Track,time:number):number {
  if(track.kind!=='audio'||track.muted||track.hidden||time<track.start||time>=track.start+track.duration)return 0;
  const into=time-track.start,left=track.duration-into;
  const fadeIn=Math.max(0,track.fadeIn||0),fadeOut=Math.max(0,track.fadeOut||0);
  const inGain=fadeIn>0?clamp(into/fadeIn,0,1):1,outGain=fadeOut>0?clamp(left/fadeOut,0,1):1;
  return round(clamp((track.volume??1)*Math.min(inGain,outGain),0,2));
}

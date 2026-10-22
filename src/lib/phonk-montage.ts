/** Editor-first, source-licensed Phonk montage builder. No placeholder clips or invented viral trends. */
import {alignedBeats} from './beat-sync.ts';
import {generateMotion} from './director.ts';
import type {StudioProject,Track,Transition} from './types.ts';

export type PhonkMontageStyle='hardcut'|'drift'|'memphis';
export type MontageResult={project:StudioProject;cuts:number;reason?:string;usedAudioBeats:boolean};
export const MONTAGE_STYLES:ReadonlyArray<{id:PhonkMontageStyle;name:string;description:string;minGap:number;maxGap:number;transition:Transition}>= [
  {id:'hardcut',name:'Hard Phonk Montage',description:'Fast cuts on kicks, aggressive punch animation and brief glitches',minGap:.42,maxGap:1.35,transition:'glitch'},
  {id:'drift',name:'Night Drift Edit',description:'Longer driving shots, smooth parallax and velocity whip entries',minGap:.7,maxGap:2.25,transition:'whip'},
  {id:'memphis',name:'Memphis VHS Edit',description:'Deliberate analog pacing with stutter cuts and dusty motion',minGap:1,maxGap:2.9,transition:'fade'}
] as const;
const round=(v:number)=>Math.round(v*1000)/1000;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
function cutPoints(project:StudioProject,style:PhonkMontageStyle,limit:number){
  const conf=MONTAGE_STYLES.find(s=>s.id===style)??MONTAGE_STYLES[0];
  const beats=alignedBeats(project.beatSync,project.duration)
    .filter(e=>e.strength>=.24&&e.at>.18&&e.at<project.duration-.2)
    .sort((a,b)=>a.at-b.at);
  const points=[0];
  let cursor=0;
  while(cursor<project.duration-.2&&points.length<limit){
    const from=cursor+conf.minGap,until=Math.min(project.duration,cursor+conf.maxGap);
    const choices=beats.filter(e=>e.at>=from&&e.at<=until);
    const candidate=choices.length?choices.reduce((a,b)=>{
      const score=(x:typeof b)=>(x.drop?2.4:0)+x.strength+Math.max(0,1-Math.abs(x.at-(from+until)*.5)/conf.maxGap);
      return score(b)>score(a)?b:a;
    }):null;
    let next=candidate?.at??Math.min(project.duration,cursor+(conf.minGap+conf.maxGap)*.55);
    next=round(clamp(next,from,project.duration));
    if(project.duration-next<conf.minGap*.55)next=project.duration;
    if(next-cursor<.18)break;
    points.push(next);cursor=next;
  }
  if(points.at(-1)!<project.duration)points.push(project.duration);
  return {points,usedAudioBeats:beats.length>0};
}
/** Intentionally requires real user-supplied visual clips; refuses to manufacture "trending" footage. */
export function createPhonkMontage(project:StudioProject,style:PhonkMontageStyle,limit=42):MontageResult{
  const visuals=project.tracks.filter(t=>['video','image'].includes(t.kind)&&t.assetId&&!t.hidden);
  const assets=[...new Set(visuals.map(t=>t.assetId!))];
  if(assets.length<2)return {project,cuts:0,reason:'Import at least two different images or video files in Assets before generating a real montage.',usedAudioBeats:false};
  if(!project.tracks.some(t=>t.kind==='audio'&&t.assetId&&!t.hidden))return {project,cuts:0,reason:'Import a music file before beat-editing your footage.',usedAudioBeats:false};
  const conf=MONTAGE_STYLES.find(s=>s.id===style)??MONTAGE_STYLES[0];
  const protectedTracks=project.tracks.filter(t=>t.kind!=='image'&&t.kind!=='video');
  const max=Math.max(0,Math.min(60,80-protectedTracks.length,Math.floor(limit)));
  if(max<2)return {project,cuts:0,reason:'Too many existing timeline layers.',usedAudioBeats:false};
  const {points,usedAudioBeats}=cutPoints(project,style,max);
  const segments:Track[]=[];
  const candidates=visuals.filter((t,i,all)=>all.findIndex(x=>x.assetId===t.assetId)===i);
  for(let i=0;i<points.length-1;i++){
    const start=points[i],duration=round(points[i+1]-start);
    if(duration<.1)continue;
    const source=candidates[i%candidates.length],rate=source.kind==='video'?(source.playbackRate||1):1;
    const mediaSeconds=source.sourceDuration??0;
    const sourceOffset=source.kind==='video'&&mediaSeconds>.2
      ?round(((i*1.37)+Math.max(0,source.clipStart||0))%Math.max(.2,mediaSeconds-.15)):0;
    const transition=(i===0?'none':conf.transition);
    const clip:Track={
      ...source,id:`montage-${i}-${source.id}`,label:`${i+1} · ${source.label}`,
      start,duration,sourceDuration:source.sourceDuration,
      clipStart:sourceOffset,playbackRate:rate,transition,fadeIn:0,fadeOut:0,
      motion:{x:50,y:50,scale:1,rotation:0,opacity:1},keyframes:[],
    };
    segments.push(generateMotion(clip,style==='hardcut'?'punch':style==='drift'?'drift':'glide',style==='hardcut'?81:65));
  }
  if(segments.length<2)return {project,cuts:0,reason:'The song is too short to make two clips.',usedAudioBeats};
  const palette=style==='drift'?['#3cb6ff','#fc436f']:style==='memphis'?['#e17b55','#a17b64']:['#ff345e','#8b5cff'];
  const tracks:Track[]=[...protectedTracks.map(t=>t.kind==='visualizer'?{...t,hidden:true}:t),...segments];
  return {
    project:{...project,updatedAt:Date.now(),template:`montage-${style}`,tracks,
      settings:{...project.settings,aspect:'9:16',width:720,fps:30,
        mode:style==='drift'?'phonk-drift':style==='memphis'?'phonk-tape':'phonk-skull',
        backdrop:'solid',primary:palette[0],secondary:palette[1],
        shake:style==='hardcut'?18:style==='drift'?10:5,
        zoom:style==='hardcut'?14:style==='drift'?10:5,
        beatPulse:style==='hardcut'?31:17,chromatic:style==='hardcut'?22:10,
        glow:42,vignette:45,grain:style==='memphis'?47:12}},
    cuts:segments.length,usedAudioBeats
  };
}

import type { Motion, MotionKeyframe, StudioProject, Track } from './types';
export const DEFAULT_MOTION:Motion = {x:50,y:50,scale:1,rotation:0,opacity:1};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const motionValue=(m:Partial<Motion>|undefined,key:keyof Motion)=>m?.[key]??DEFAULT_MOTION[key];
export function evaluateMotion(track:Track,time:number):Motion {
  const base={...DEFAULT_MOTION,...track.motion};
  const keys=(track.keyframes||[]).slice().sort((a,b)=>a.at-b.at);
  if(!keys.length)return base;
  const at=Math.max(0,time-track.start);
  if(at<=keys[0].at)return {...base,...keys[0]};
  if(at>=keys[keys.length-1].at)return {...base,...keys[keys.length-1]};
  for(let i=1;i<keys.length;i++){
    if(keys[i].at>=at){const a=keys[i-1],b=keys[i],f=(at-a.at)/(b.at-a.at||1);
      return {x:lerp(motionValue({...base,...a},'x'),motionValue({...base,...b},'x'),f),y:lerp(motionValue({...base,...a},'y'),motionValue({...base,...b},'y'),f),scale:lerp(motionValue({...base,...a},'scale'),motionValue({...base,...b},'scale'),f),rotation:lerp(motionValue({...base,...a},'rotation'),motionValue({...base,...b},'rotation'),f),opacity:lerp(motionValue({...base,...a},'opacity'),motionValue({...base,...b},'opacity'),f)};
    }
  }
  return base;
}
export function upsertKeyframe(track:Track,t:number,motion:Partial<Motion>):Track {
  const at=Math.round(Math.max(0,Math.min(track.duration,t-track.start))*1000)/1000;
  const keys=(track.keyframes||[]).filter(k=>Math.abs(k.at-at)>.045);
  keys.push({at,...motion});keys.sort((a,b)=>a.at-b.at);
  return {...track,keyframes:keys.slice(0,80)};
}
export function removeKeyframe(track:Track,t:number):Track {
  const at=t-track.start;
  const match=(track.keyframes||[]).reduce((best,k)=>Math.abs(k.at-at)<Math.abs((best?.at??Infinity)-at)?k:best,undefined as MotionKeyframe|undefined);
  if(!match||Math.abs(match.at-at)>.35)return track;
  return {...track,keyframes:track.keyframes?.filter(k=>k!==match)};
}
export function splitTrack(project:StudioProject,id:string,at:number,newId:string):StudioProject {
  const i=project.tracks.findIndex(t=>t.id===id);
  if(i<0||project.tracks.length>=80)return project;
  const track=project.tracks[i];
  if(at<=track.start+.10||at>=track.start+track.duration-.10)return project;
  if(track.kind==='audio'){
    const before=Math.round((at-track.start)*1000)/1000,after=Math.round((track.duration-before)*1000)/1000;
    const tracks=[...project.tracks];tracks.splice(i,1,{...track,duration:before},{...track,id:newId,label:`${track.label} • part 2`,start:at,duration:after,clipStart:(track.clipStart||0)+before,fadeIn:0});
    return {...project,tracks,updatedAt:Date.now()};
  }
  const before=at-track.start, after=track.duration-before;
  const boundary=evaluateMotion(track,at);
  const leftKeys=[...(track.keyframes||[]).filter(k=>k.at<before),{at:before,...boundary}];
  const rightKeys=[{at:0,...boundary},...(track.keyframes||[]).filter(k=>k.at>before).map(k=>({...k,at:k.at-before}))];
  const first={...track,duration:before,keyframes:leftKeys};
  const second={...track,id:newId,label:`${track.label} · part 2`,start:at,duration:after,
    clipStart:(track.clipStart||0)+before*(track.kind==='video'?(track.playbackRate||1):1),keyframes:rightKeys};
  const tracks=[...project.tracks];tracks.splice(i,1,first,second);
  return {...project,tracks,updatedAt:Date.now()};
}
export function snapTime(t:number,beats:number[],tolerance=.12):number {
  if(!beats.length)return t;
  const index=beats.reduce((best,beat,i)=>Math.abs(beat-t)<Math.abs(beats[best]-t)?i:best,0);
  return Math.abs(beats[index]-t)<=tolerance?beats[index]:t;
}
export function trackTransition(track:Track,time:number):{opacity:number;dx:number;scale:number;rotation?:number}{
  if(track.transition==='none'||!track.transition)return {opacity:1,dx:0,scale:1};
  const into=Math.min(1,Math.max(0,(time-track.start)/.45));
  const out=Math.min(1,Math.max(0,(track.start+track.duration-time)/.45));
  const f=Math.min(into,out);
  if(track.transition==='fade')return {opacity:f,dx:0,scale:1};
  if(track.transition==='slide')return {opacity:1,dx:(1-f)*-.23,scale:1};
  if(track.transition==='whip')return {opacity:1,dx:(1-f)*.8,scale:1.08+(.08*(1-f))};
  if(track.transition==='glitch')return {opacity:.68+.32*f,dx:Math.sin(f*43)*(1-f)*.06,scale:1};
  if(track.transition==='spin')return {opacity:f,dx:0,scale:.65+.35*f,rotation:(1-f)*-180};
  return {opacity:1,dx:0,scale:.80+f*.20};
}

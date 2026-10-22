import type { StudioProject, Track } from './types';
export function clampTime(n:number,max:number){return Math.min(max,Math.max(0,Number.isFinite(n)?n:0));}
export function moveTrack(project:StudioProject,id:string,direction:-1|1):StudioProject {
  const tracks=project.tracks.map(t=>({...t}));
  const from=tracks.findIndex(t=>t.id===id),to=from+direction;
  if(from<0||to<0||to>=tracks.length)return project;
  [tracks[from],tracks[to]]=[tracks[to],tracks[from]];
  return {...project,tracks,updatedAt:Date.now()};
}
export function patchTrack(project:StudioProject,id:string,patch:Partial<Track>):StudioProject {
  if(!project.tracks.some(t=>t.id===id))return project;
  return {...project,updatedAt:Date.now(),tracks:project.tracks.map(t=>{
    if(t.id!==id)return t;
    const updated={...t,...patch,id:t.id,kind:t.kind};
    updated.start=clampTime(updated.start,Math.max(0,project.duration-.1));
    updated.duration=Math.max(.1,Math.min(project.duration-updated.start,Number.isFinite(updated.duration)?updated.duration:.1));
    return updated;
  })};
}
const finite=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const color=(c:unknown)=>typeof c==='string'&&/^#[0-9a-fA-F]{6}$/.test(c);
const plain=(n:unknown,max:number)=>typeof n==='string'&&n.length<=max;
const enums=(n:unknown,allowed:readonly string[])=>typeof n==='string'&&allowed.includes(n);
const motionKeys=['x','y','scale','rotation','opacity'] as const;
function validMotion(m:unknown):boolean {
  if(!m||typeof m!=='object'||Array.isArray(m))return false;
  const data=m as Record<string,unknown>;
  return Object.keys(data).every(k=>motionKeys.includes(k as typeof motionKeys[number])&&
    (k==='x'||k==='y'?finite(data[k],0,100):k==='scale'?finite(data[k],.1,5):k==='rotation'?finite(data[k],-360,360):finite(data[k],0,1)));
}
function validTrack(t:unknown,total:number):boolean {
  if(!t||typeof t!=='object')return false;
  const x=t as Track;
  if(!enums(x.kind,['audio','image','video','text','visualizer','effect'])||!plain(x.id,110)||!x.id||!plain(x.label,100)||
    typeof x.hidden!=='boolean'||typeof x.muted!=='boolean'||!finite(x.start,0,total)||!finite(x.duration,.1,total)||x.start+x.duration>total+.011)return false;
  if(x.text!==undefined&&!plain(x.text,100)||x.assetId!==undefined&&!plain(x.assetId,110)||x.clipStart!==undefined&&!finite(x.clipStart,0,60000)||x.sourceDuration!==undefined&&!finite(x.sourceDuration,0.1,600)||
    x.volume!==undefined&&!finite(x.volume,0,2)||x.motion!==undefined&&!validMotion(x.motion)||
    x.transition!==undefined&&!enums(x.transition,['none','fade','slide','zoom'])||
    x.fontSize!==undefined&&!finite(x.fontSize,.015,.24)||x.fontColor!==undefined&&!color(x.fontColor)||
    x.fontFamily!==undefined&&!enums(x.fontFamily,['sans','serif','mono'])||
    x.fit!==undefined&&!enums(x.fit,['contain','cover'])||
    x.blend!==undefined&&!enums(x.blend,['normal','screen','multiply','overlay'])||
    x.playbackRate!==undefined&&!finite(x.playbackRate,.25,4)||
    x.fadeIn!==undefined&&!finite(x.fadeIn,0,total)||x.fadeOut!==undefined&&!finite(x.fadeOut,0,total)||
    x.flipX!==undefined&&typeof x.flipX!=='boolean')return false;
  if(x.keyframes!==undefined){
    if(!Array.isArray(x.keyframes)||x.keyframes.length>80)return false;
    if(x.keyframes.some(k=>!k||!finite(k.at,0,x.duration)||!validMotion(Object.fromEntries(Object.entries(k).filter(([key])=>key!=='at')))))return false;
  }
  return true;
}
export function normalizeProject(data:unknown):StudioProject|null {
  if(!data||typeof data!=='object'||Array.isArray(data))return null;
  const p=data as Partial<StudioProject>;
  if(p.schemaVersion!==1||!plain(p.id,100)||!p.id||!plain(p.name,100)||!Array.isArray(p.tracks)||!p.settings||typeof p.settings!=='object')return null;
  if(!finite(p.duration,1,600)||!plain(p.template,100)||!finite(p.createdAt,0,1e16)||!finite(p.updatedAt,0,1e16))return null;
  const s=p.settings;
  if(!enums(s.aspect,['16:9','9:16','1:1'])||![24,30,60].includes(s.fps)||![720,1080,1280].includes(s.width)||
    !enums(s.mode,['bars','circle','wave','particles','mirror','spiral','rings'])||!color(s.background)||!color(s.primary)||!color(s.secondary)||!plain(s.title,100))return null;
  for(const n of ['intensity','glow','shake','particles','zoom'] as const){if(!finite(s[n],0,100))return null;}
  if(s.vignette!==undefined&&!finite(s.vignette,0,100)||s.grain!==undefined&&!finite(s.grain,0,100)||
    s.beatPulse!==undefined&&!finite(s.beatPulse,0,100)||s.bitrate!==undefined&&![2,5,8].includes(s.bitrate)||
    s.backdrop!==undefined&&!enums(s.backdrop,['grid','aurora','solid'])||
    s.scanlines!==undefined&&!finite(s.scanlines,0,100)||s.chromatic!==undefined&&!finite(s.chromatic,0,100)||
    s.letterbox!==undefined&&!finite(s.letterbox,0,100))return null;
  if(s.eq!==undefined&&(!finite(s.eq.bass,-18,18)||!finite(s.eq.mid,-18,18)||!finite(s.eq.treble,-18,18)||typeof s.eq.compressor!=='boolean'))return null;
  if(p.beatSync!==undefined){
    const bs=p.beatSync;
    if(!bs||typeof bs!=='object'||typeof bs.enabled!=='boolean'||
      !enums(bs.style,['drift','hard','cinematic','minimal'])||!finite(bs.intensity,0,100)||
      !finite(bs.offset,-1,1)||
      (['kickGain','snareGain','hatGain','dropGain'] as const).some(key=>bs[key]!==undefined&&!finite(bs[key],0,200))||
      !bs.map||bs.map.version!==1||
      !enums(bs.map.source,['analysis','manual'])||!finite(bs.map.duration,0,600)||
      !(bs.map.bpm===null||finite(bs.map.bpm,50,240))||!finite(bs.map.confidence,0,1)||
      !Array.isArray(bs.map.events)||bs.map.events.length>1200)return null;
    if(bs.map.events.some((e,i)=>!e||!finite(e.at,0,bs.map.duration+.01)||
      (i>0&&e.at<bs.map.events[i-1].at)||!finite(e.strength,0,1)||
      !enums(e.band,['kick','snare','hat'])||typeof e.drop!=='boolean'))return null;
  }
  if(p.tracks.length>80||p.tracks.some(t=>!validTrack(t,p.duration!)))return null;
  if(new Set(p.tracks.map(t=>t.id)).size!==p.tracks.length)return null;
  return p as StudioProject;
}

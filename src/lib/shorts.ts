/** Shorts Lab: offline, non-destructive-to-files suggestion and timeline editing.
 * Score is a heuristic from detected beat strength and drops, NOT platform trending data.
 */
import type {StudioProject,Track} from './types.ts';
import type {BeatMap} from './beat-sync.ts';

export const MAX_COMPOSITION_SECONDS=600;
const round=(n:number)=>Math.round(n*1000)/1000;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export type HookSuggestion={start:number;end:number;length:number;score:number;reason:string};

export function restartPosition(position:number,duration:number):number {
  if(!Number.isFinite(duration)||duration<=0)return 0;
  return !Number.isFinite(position)||position>=duration-.045?0:clamp(position,0,duration);
}

/** Extends template background, without stretching manually cut or uploaded footage. */
export function resizeComposition(project:StudioProject,duration:number):StudioProject {
  if(!Number.isFinite(duration))return project;
  const next=clamp(round(duration),1,MAX_COMPOSITION_SECONDS);
  const tracks=project.tracks.map(t=>{
    const span=t.start===0&&Math.abs(t.duration-project.duration)<.11;
    const start=Math.min(t.start,Math.max(0,next-.1));
    const requested=(span&&['visualizer','effect','text'].includes(t.kind))?next:t.duration;
    return {...t,start,duration:round(clamp(requested,.1,next-start))};
  });
  return {...project,duration:next,tracks,updatedAt:Date.now()};
}

/** Stable ranking of hooks at the user's requested Shorts duration; no network use. */
export function suggestHooks(map:BeatMap|null|undefined,sourceDuration:number,seconds:15|30|60=15):HookSuggestion[]{
  if(!Number.isFinite(sourceDuration)||sourceDuration<1)return [];
  const total=clamp(sourceDuration,1,MAX_COMPOSITION_SECONDS);
  const length=Math.min(total,seconds);
  const events=map?.events.filter(e=>Number.isFinite(e.at)&&e.at>=0&&e.at<=total)||[];
  const step=Math.max(.5,Math.min(3,length/12));
  const candidateStarts:number[]=[0,Math.max(0,total-length)];
  for(let at=0;at<total-length;at+=step)candidateStarts.push(round(at));
  const scored=candidateStarts.map(raw=>{
    const start=clamp(raw,0,total-length),end=start+length;
    const group=events.filter(e=>e.at>=start&&e.at<end);
    const drops=group.filter(e=>e.drop).length, strong=group.filter(e=>e.strength>.7).length;
    let energy=0;
    for(const e of group)energy+=e.strength*(e.band==='kick'?1.25:e.band==='snare'?1.05:.65)*(e.drop?3.2:1);
    const first=group.filter(e=>e.at<=start+Math.min(3,length)).reduce((sum,e)=>sum+e.strength*(e.drop?3:1),0);
    const score=round((energy+first*.7)/Math.max(1,length)+Math.min(1,drops)*.45);
    const reason=drops?'Drop-focused hook':strong>=3?'Strong bass / drum hits':group.length?'Rhythmic section':'Opening section (low confidence)';
    return {start:round(start),end:round(end),length:round(length),score,reason};
  }).sort((a,b)=>b.score-a.score||a.start-b.start);
  const chosen:HookSuggestion[]=[];
  for(const item of scored){
    if(chosen.every(old=>Math.abs(old.start-item.start)>=Math.min(length*.55,10)))chosen.push(item);
    if(chosen.length===3)break;
  }
  return chosen;
}

/** Use one user-owned source audio clip for a selected Shorts hook, preserving Undo. */
export function applyShortHook(project:StudioProject,assetId:string,from:number,to:number,fullMap?:BeatMap|null):StudioProject {
  const audio=project.tracks.find(t=>t.kind==='audio'&&t.assetId===assetId);
  const available=audio?.sourceDuration||fullMap?.duration||MAX_COMPOSITION_SECONDS;
  if(!audio||!Number.isFinite(from)||!Number.isFinite(to)||from<0||to>available+.001||to-from<1)return project;
  const start=round(from),duration=round(to-from);
  const scaled=resizeComposition(project,duration);
  const audioTrack:Track={...audio,start:0,clipStart:start,duration,sourceDuration:available,fadeIn:0,fadeOut:0};
  const map=fullMap||project.beatSync?.map;
  const events=map?.events.filter(e=>e.at>=start&&e.at<to).map(e=>({...e,at:round(e.at-start)}))||[];
  return {...scaled,updatedAt:Date.now(),
    tracks:[audioTrack,...scaled.tracks.filter(t=>t.kind!=='audio')],
    settings:{...scaled.settings,aspect:'9:16',width:720,fps:30},
    beatSync:project.beatSync?{...project.beatSync,map:{...project.beatSync.map,duration,bpm:map?.bpm||null,confidence:map?.confidence||0,events}}:undefined
  };
}

/** Split a source audio clip without altering the original file. */
export function splitAudioSegment(project:StudioProject,id:string,at:number,newId:string):StudioProject {
  const index=project.tracks.findIndex(t=>t.id===id);
  if(index<0||project.tracks.length>=80)return project;
  const track=project.tracks[index];
  if(track.kind!=='audio'||!Number.isFinite(at)||at<=track.start+.1||at>=track.start+track.duration-.1)return project;
  const firstDuration=round(at-track.start),remaining=round(track.duration-firstDuration);
  const result=[...project.tracks];
  result.splice(index,1,{...track,duration:firstDuration},{...track,id:newId,label:track.label+' • part 2',start:round(at),duration:remaining,clipStart:round((track.clipStart||0)+firstDuration),fadeIn:0});
  return {...project,tracks:result,updatedAt:Date.now()};
}

/** Join adjacent audio segments by placing next at the selected clip end;
 * merge metadata into one clip only when source offsets are continuous.
 * Discontinuous cuts remain separate playable timeline clips.
 */
export function joinNextAudio(project:StudioProject,id:string):StudioProject {
  const sorted=project.tracks.filter(t=>t.kind==='audio').sort((a,b)=>a.start-b.start);
  const index=sorted.findIndex(t=>t.id===id);
  if(index<0||index>=sorted.length-1)return project;
  const first=sorted[index],next=sorted[index+1];
  if(first.assetId!==next.assetId||!first.assetId)return project;
  const desired=round(first.start+first.duration);
  if(desired+next.duration>project.duration+.001)return project;
  const touchingSource=Math.abs((first.clipStart||0)+first.duration-(next.clipStart||0))<.012;
  if(touchingSource&&!first.fadeOut&&!next.fadeIn){
    const tracks=project.tracks.filter(t=>t.id!==next.id).map(t=>t.id===first.id?{...t,duration:round(first.duration+next.duration)}:t);
    return {...project,tracks,updatedAt:Date.now()};
  }
  return {...project,tracks:project.tracks.map(t=>t.id===next.id?{...t,start:desired}:t),updatedAt:Date.now()};
}

/** Non-destructive source in/out trim for one audio segment. */
export function trimAudioSegment(project:StudioProject,id:string,sourceIn:number,sourceOut:number):StudioProject {
  const track=project.tracks.find(t=>t.id===id&&t.kind==='audio');
  if(!track||!Number.isFinite(sourceIn)||!Number.isFinite(sourceOut))return project;
  const limit=track.sourceDuration||MAX_COMPOSITION_SECONDS;
  if(sourceIn<0||sourceOut>limit+.001||sourceOut-sourceIn<.1)return project;
  const dur=round(Math.min(sourceOut-sourceIn,project.duration-track.start));
  return {...project,updatedAt:Date.now(),tracks:project.tracks.map(t=>t.id===id?{...t,clipStart:round(sourceIn),duration:Math.max(.1,dur)}:t)};
}

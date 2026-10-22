/** Local-first music analysis, beat-synced FX and non-destructive-to-media edit planning.
 * Tempo and drops are estimates. No cloud service or proprietary model is involved.
 */
import type {StudioProject,Track} from './types.ts';
export type BeatBand='kick'|'snare'|'hat';
export type BeatEvent={at:number;strength:number;band:BeatBand;drop:boolean};
export type BeatStyle='drift'|'hard'|'cinematic'|'minimal';
export type BeatMap={version:1;source:'analysis'|'manual';duration:number;bpm:number|null;confidence:number;events:BeatEvent[]};
export type BeatSync={enabled:boolean;style:BeatStyle;intensity:number;offset:number;map:BeatMap;
  kickGain?:number;snareGain?:number;hatGain?:number;dropGain?:number};
export const emptyMap=(duration:number):BeatMap=>({version:1,source:'manual',duration,bpm:null,confidence:0,events:[]});
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const fixed=(n:number)=>Math.round(n*1000)/1000;
const median=(list:number[])=>{if(!list.length)return 0;const s=[...list].sort((a,b)=>a-b);return s[Math.floor(s.length/2)];};
/** Estimate energy transients from low/mid/high pass-separated PCM envelopes at 10 ms hops. */
export function detectBeats(samples:Float32Array,sampleRate:number):BeatMap {
  const duration=samples.length/sampleRate;
  if(!samples.length||!Number.isFinite(sampleRate)||sampleRate<2000||!Number.isFinite(duration)||duration>600)return emptyMap(Number.isFinite(duration)?clamp(duration,0,600):0);
  const hop=Math.max(1,Math.floor(sampleRate*.01)), lowAlpha=Math.min(.6,2*Math.PI*175/sampleRate), smoothAlpha=Math.min(.8,2*Math.PI*2200/sampleRate);
  const energies:{low:number;mid:number;high:number;total:number}[]=[];
  let low=0,mid=0;
  for(let i=0;i<samples.length;i+=hop){
    let l=0,m=0,h=0,count=0;
    const end=Math.min(samples.length,i+hop),skip=Math.max(1,Math.floor(sampleRate/16000));
    // Filter step adjusts to decimation; retains deterministic bounded CPU usage.
    const a=1-Math.pow(1-lowAlpha,skip),b=1-Math.pow(1-smoothAlpha,skip);
    for(let j=i;j<end;j+=skip){const v=samples[j]||0;low+=a*(v-low);mid+=b*(v-mid);
      const lv=low, mv=mid-low, hv=v-mid;l+=lv*lv;m+=mv*mv;h+=hv*hv;count++;
    }
    l=Math.sqrt(l/Math.max(1,count));m=Math.sqrt(m/Math.max(1,count));h=Math.sqrt(h/Math.max(1,count));
    energies.push({low:l,mid:m,high:h,total:l+m+h});
  }
  const novelty=energies.map((x,i)=>{
    const prev=energies[Math.max(0,i-3)];
    return {low:Math.max(0,x.low-prev.low),mid:Math.max(0,x.mid-prev.mid),high:Math.max(0,x.high-prev.high)};
  });
  const transients=novelty.map(x=>Math.max(x.low*1.2,x.mid*.95,x.high*.75));
  const global=median(transients.filter(x=>x>0));
  const peak=Math.max(...energies.map(x=>x.total));
  if(peak<.003||global<=0)return {...emptyMap(duration),source:'analysis'};
  const events:BeatEvent[]=[];
  for(let i=4;i<transients.length-4;i++){
    const val=transients[i];if(val<=transients[i-1]||val<transients[i+1])continue;
    // Nearby adaptive mean preserves quiet breakdowns and loud drop sections.
    let sum=0,n=0;
    for(let j=Math.max(0,i-65);j<=Math.min(transients.length-1,i+65);j+=5){sum+=transients[j];n++;}
    const threshold=Math.max(global*1.55,(sum/Math.max(1,n))*1.7,.0026);
    if(val<threshold)continue;
    const at=fixed(i*hop/sampleRate);
    if(at<.03||at>duration-.02)continue;
    const x=novelty[i];const band:BeatBand=x.low*1.15>=Math.max(x.mid,x.high*.9)?'kick':x.mid>=x.high*.8?'snare':'hat';
    const strength=clamp(val/(threshold*2.6),.1,1);
    if(events.length&&at-events[events.length-1].at<.16){
      if(strength>events[events.length-1].strength)events[events.length-1]={at,strength,band,drop:false};
      continue;
    }
    events.push({at,strength,band,drop:false});
    if(events.length>=1200)break;
  }
  // Estimate tempo from repeating inter-onset intervals, folding into useful half/double time.
  const votes=new Map<number,number>();
  for(let i=0;i<events.length;i++)for(let j=Math.max(0,i-4);j<i;j++){
    let interval=events[i].at-events[j].at;
    if(interval<.23||interval>2.2)continue;
    while(interval<60/190)interval*=2;
    while(interval>60/65)interval/=2;
    const bpm=Math.round(60/interval/2)*2;
    votes.set(bpm,(votes.get(bpm)||0)+(events[i].band==='kick'?1.25:1));
  }
  const ranked=[...votes].sort((a,b)=>b[1]-a[1]);const winner=ranked[0];
  const voteSum=ranked.reduce((sum,x)=>sum+x[1],0);
  const confidence=winner?clamp(winner[1]/Math.max(1,voteSum)*4,0,1):0;
  const bpm=events.length>=6&&winner&&confidence>=.26?winner[0]:null;
  // Drop candidates: strongest kick after a less energetic phrase or larger spacing.
  for(let i=0;i<events.length;i++){
    const e=events[i];if(e.band!=='kick'||e.strength<.62)continue;
    const nearby=events.slice(Math.max(0,i-8),i);
    const mean=nearby.length?nearby.reduce((s,x)=>s+x.strength,0)/nearby.length:0;
    const gap=i?e.at-events[i-1].at:0;
    if(i>=3&&(e.strength>mean*1.55||gap>.75))e.drop=true;
  }
  return {version:1,source:'analysis',duration:fixed(duration),bpm,confidence:fixed(confidence),events};
}
/** Turn a tapped tempo into a strict manual rhythm grid, useful for tracks where onset detection misses the pulse. */
export function generateTempoGrid(duration:number,bpm:number,anchor=0):BeatMap {
  if(!Number.isFinite(duration)||duration<=0||duration>600||!Number.isFinite(bpm)||bpm<50||bpm>240||!Number.isFinite(anchor))return emptyMap(Math.max(0,Math.min(600,duration||0)));
  const interval=60/bpm,base=((anchor%interval)+interval)%interval;
  const events:BeatEvent[]=[];
  for(let at=base;at<duration&&events.length<1200;at+=interval){
    const index=events.length;
    events.push({at:fixed(at),strength:index%4===0?1:.75,band:index%2===0?'kick':'snare',drop:false});
  }
  return {version:1,source:'manual',duration:fixed(duration),bpm:Math.round(bpm*10)/10,confidence:1,events};
}
export function beatMarkersCSV(sync:BeatSync|undefined,duration:number):string {
  const lines=['Time (seconds),Type,Strength,Drop'];
  for(const e of alignedBeats(sync,duration))lines.push([e.at.toFixed(3),e.band,e.strength.toFixed(3),e.drop?'Yes':'No'].join(','));
  return lines.join('\r\n')+'\r\n';
}
export function addManualBeat(map:BeatMap,time:number,band:BeatBand='kick'):BeatMap {
  if(!Number.isFinite(time)||time<0||time>map.duration)return map;
  const at=fixed(time),events=map.events.filter(e=>Math.abs(e.at-at)>.08);
  events.push({at,strength:1,band,drop:false});events.sort((a,b)=>a.at-b.at);
  return {...map,source:'manual',events:events.slice(0,1200)};
}
export function removeNearestBeat(map:BeatMap,time:number,tolerance=.22):BeatMap {
  const index=map.events.reduce((best,e,i)=>best<0||Math.abs(e.at-time)<Math.abs(map.events[best].at-time)?i:best,-1);
  if(index<0||Math.abs(map.events[index].at-time)>tolerance)return map;
  return {...map,source:'manual',events:map.events.filter((_,i)=>i!==index)};
}
export function nudgeBeatMap(map:BeatMap,delta:number):BeatMap {
  if(!Number.isFinite(delta)||Math.abs(delta)>1)return map;
  return {...map,events:map.events.map(e=>({...e,at:fixed(clamp(e.at+delta,0,map.duration))})).sort((a,b)=>a.at-b.at)};
}
export function alignedBeats(sync:BeatSync|undefined,duration:number):BeatEvent[]{
  if(!sync)return [];
  return sync.map.events.map(e=>({...e,at:fixed(e.at+sync.offset)})).filter(e=>e.at>=0&&e.at<=duration);
}
/** Deterministic time-indexed beat response shared by video preview, snapshots and export. */
export function beatEnvelope(sync:BeatSync|undefined,time:number):{pulse:number;drop:number;band:BeatBand|null}{
  if(!sync?.enabled||!sync.map.events.length)return {pulse:0,drop:0,band:null};
  const at=time-sync.offset,events=sync.map.events;
  let left=0,right=events.length;
  while(left<right){const mid=(left+right)>>>1;if(events[mid].at<=at)left=mid+1;else right=mid;}
  let pulse=0,drop=0,band:BeatBand|null=null;
  for(const index of [left-1,left]){
    const e=events[index];if(!e)continue;
    const gap=at-e.at;
    if(gap<-.035||gap>.34)continue;
    const response=gap<0?.28:Math.pow(1-clamp(gap/.34,0,1),2);
    const gain=(e.band==='kick'?sync.kickGain:e.band==='snare'?sync.snareGain:sync.hatGain)??100;
    const value=response*e.strength*sync.intensity/100*gain/100;
    if(value>pulse){pulse=value;band=e.band;}
    if(e.drop)drop=Math.max(drop,value*(sync.dropGain??100)/100);
  }
  return {pulse,drop,band};
}
export type MontageOptions={beatsPerCut:1|2|4|8;transition:'none'|'fade'|'slide'|'zoom';maxClips?:number};
/** Generate cuts using actual beats. Never alters asset blobs or audio. Undo restores original clips. */
export function autoMontage(project:StudioProject,opts:MontageOptions):StudioProject {
  const visuals=project.tracks.filter(t=>(t.kind==='image'||t.kind==='video')&&t.assetId&&!t.hidden);
  const beats=alignedBeats(project.beatSync,project.duration).filter(e=>e.band!=='hat');
  if(!visuals.length||beats.length<2)return project;
  const boundaries=[0,...beats.filter((_,i)=>i%opts.beatsPerCut===0).map(e=>e.at),project.duration]
    .filter((n,i,list)=>Number.isFinite(n)&&n>=0&&n<=project.duration&&(i===0||n-list[i-1]>=.1));
  const unique=[...new Set(boundaries.map(fixed))].sort((a,b)=>a-b);
  const available=Math.max(0,80-project.tracks.filter(t=>!(t.kind==='image'||t.kind==='video')).length);
  const cap=Math.min(opts.maxClips??56,available);
  const planned:Track[]=[];
  for(let i=0;i<unique.length-1&&planned.length<cap;i++){
    const start=unique[i],end=unique[i+1],duration=end-start;
    if(duration<.1)continue;
    const original=visuals[planned.length%visuals.length];
    planned.push({...original,id:`montage-${i}-${original.id}`,label:`Cut ${planned.length+1} · ${original.label}`,
      start,duration,clipStart:original.kind==='video'?(original.clipStart||0):0,
      transition:opts.transition,keyframes:[]});
  }
  if(planned.length<2)return project;
  // When safety cap is reached, lengthen the last cut to avoid a black screen at the end.
  const last=planned[planned.length-1];last.duration=fixed(project.duration-last.start);
  return {...project,updatedAt:Date.now(),tracks:[...project.tracks.filter(t=>!(t.kind==='image'||t.kind==='video')), ...planned]};
}
export function addDropTitles(project:StudioProject,text='BASS DROP'):StudioProject {
  const drops=alignedBeats(project.beatSync,project.duration).filter(e=>e.drop);
  if(!drops.length)return project;
  const room=Math.max(0,80-project.tracks.length);
  const extras:Track[]=drops.slice(0,Math.min(room,10)).filter(e=>e.at<project.duration-.1).map((e,i)=>({
    id:`drop-title-${i}-${Math.round(e.at*1000)}`,kind:'text',label:`Drop caption ${i+1}`,
    start:e.at,duration:Math.min(.85,project.duration-e.at),hidden:false,muted:false,
    text:text.slice(0,60),fontColor:project.settings.primary,fontSize:.095,fontFamily:'sans',transition:'zoom',
    keyframes:[{at:0,scale:1.65,opacity:0},{at:Math.min(.16,project.duration-e.at),scale:1,opacity:1},{at:Math.min(.82,project.duration-e.at),scale:1.08,opacity:0}]
  }));
  return extras.length?{...project,updatedAt:Date.now(),tracks:[...project.tracks,...extras]}:project;
}

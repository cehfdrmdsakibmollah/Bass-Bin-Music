'use client';
import {useEffect,useRef,useState} from 'react';
import {DEFAULT_MIX,planPhonkMashup,routeMashup,encodePcmWav,type MixControls} from '@/lib/phonk-mix';

type Source={name:string;duration:number;buffer:AudioBuffer};
type Slot='a'|'b';
const fmt=(n:number)=>`${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;
function localDownload(file:File){
 const url=URL.createObjectURL(file),a=document.createElement('a');
 a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60_000);
}
export default function PhonkMusicLab({onUse}:{onUse:(file:File)=>Promise<void>}){
 const [sources,setSources]=useState<{a:Source|null;b:Source|null}>({a:null,b:null});
 const [mix,setMix]=useState<MixControls>(DEFAULT_MIX);
 const [status,setStatus]=useState('Upload two tracks you own or have permission to remix.');
 const [busy,setBusy]=useState(false);
 const [playing,setPlaying]=useState(false);
 const preview=useRef<{context:AudioContext;nodes:AudioBufferSourceNode[]}|null>(null);
 const stop=()=>{
  const old=preview.current;preview.current=null;
  if(old){for(const node of old.nodes)try{node.stop()}catch{};void old.context.close();}
  setPlaying(false);
 };
 useEffect(()=>()=>{const old=preview.current;if(old){for(const n of old.nodes)try{n.stop()}catch{};void old.context.close();}},[]);
 const load=async(slot:Slot,file?:File)=>{
  if(!file)return;
  if(file.size>45*1024*1024){setStatus('File too large: limit 45 MB per source.');return;}
  setBusy(true);stop();
  const ctx=new AudioContext();
  try{
    const b=await ctx.decodeAudioData(await file.arrayBuffer());
    if(b.duration<.5)throw Error('Track is too short');
    if(b.duration>600)throw Error('Choose music shorter than ten minutes');
    setSources(p=>({...p,[slot]:{name:file.name,duration:b.duration,buffer:b}}));
    setMix(p=>({...p,...(slot==='a'?{aIn:0,aOut:Math.min(30,b.duration)}:{bIn:0,bOut:Math.min(30,b.duration)})}));
    setStatus(`Track ${slot.toUpperCase()} ready: ${fmt(b.duration)}. Edit its In/Out points.`);
  }catch(e){setStatus('Cannot decode audio: '+(e instanceof Error?e.message:'unknown error'));}
  finally{void ctx.close();setBusy(false);}
 };
 const plan=()=>{
  if(!sources.a||!sources.b)throw Error('Choose both Phonk tracks first.');
  return planPhonkMashup(sources.a.duration,sources.b.duration,mix);
 };
 const play=async()=>{
  if(preview.current){stop();return;}
  try{
   const p=plan();const ctx=new AudioContext();
   const nodes=routeMashup(ctx,sources.a!.buffer,sources.b!.buffer,p);
   preview.current={context:ctx,nodes};setPlaying(true);
   await ctx.resume();
   // Stop after the final source ends, without background timers.
   nodes[1].onended=()=>{
     if(preview.current?.context===ctx){preview.current=null;void ctx.close();setPlaying(false);}
   };
   setStatus(`Playing ${fmt(p.duration)} two-track crossfade preview.`);
  }catch(e){setStatus(e instanceof Error?e.message:'Playback unavailable');stop();}
 };
 const render=async(useInVideo=false)=>{
  if(busy)return;
  setBusy(true);stop();
  try{
   const p=plan();
   const hz=44100;
   const ctx=new OfflineAudioContext(2,Math.ceil(p.duration*hz),hz);
   routeMashup(ctx,sources.a!.buffer,sources.b!.buffer,p);
   setStatus('Rendering two-track mashup locally; keep this tab open.');
   const rendered=await ctx.startRendering();
   const wav=encodePcmWav([rendered.getChannelData(0),rendered.getChannelData(1)],hz);
   const file=new File([wav],'BASS-BIN-Phonk-Mashup.wav',{type:'audio/wav'});
   if(useInVideo){
     await onUse(file);
     setStatus('Mixed WAV imported into Studio as its new main audio. Original source files remain unchanged.');
   } else {localDownload(file);setStatus('Two-song Phonk WAV downloaded successfully.');}
  }catch(e){setStatus('Mashup unavailable: '+(e instanceof Error?e.message:'unknown error'));}
  finally{setBusy(false);}
 };
 const fields:{key:keyof MixControls;title:string;min:number;max:number;step:number}[]=[
  {key:'aIn',title:'Track A In (s)',min:0,max:Math.max(.25,(sources.a?.duration||30)-.25),step:.1},
  {key:'aOut',title:'Track A Out (s)',min:.25,max:sources.a?.duration||30,step:.1},
  {key:'bIn',title:'Track B In (s)',min:0,max:Math.max(.25,(sources.b?.duration||30)-.25),step:.1},
  {key:'bOut',title:'Track B Out (s)',min:.25,max:sources.b?.duration||30,step:.1},
  {key:'crossfade',title:'Crossfade overlap (s)',min:0,max:15,step:.25},
  {key:'speedB',title:'Track B speed / pitch (×)',min:.75,max:1.5,step:.01},
  {key:'volumeA',title:'Track A level',min:0,max:1.5,step:.05},
  {key:'volumeB',title:'Track B level',min:0,max:1.5,step:.05},
  {key:'bassDb',title:'Bass shelf (+/- dB)',min:-12,max:12,step:1}
 ];
 let durationLabel='Add two songs to see the mashup duration';
 try{const p=plan();durationLabel=`A: ${fmt(p.aLength)} · B: ${fmt(p.bLength)} · overlap ${p.overlap.toFixed(1)}s · output ${fmt(p.duration)}`;}catch{}
 return <div className="music-lab">
   <div className="panel-heading"><h2>Phonk Music Lab</h2><small>Two-track creator mixer</small></div>
   <p className="muted detail">BandLab-inspired Phonk-only mini-mixer. Combine two audio files with editable trims, BPM-independent speed, crossfade, levels, bass shelf and gentle compression. Mixing does not remove copyright.</p>
   <div className="music-decks">{(['a','b'] as const).map(slot=><div className="music-deck" key={slot}>
     <strong>DECK {slot.toUpperCase()}</strong>
     <label className="btn outline full">♫ {sources[slot]?'Replace song':'Import song'}
       <input type="file" hidden accept=".mp3,.wav,.ogg,.m4a,.aac,audio/*" disabled={busy}
        aria-label={`Music deck ${slot.toUpperCase()} upload`}
        onChange={e=>{void load(slot,e.currentTarget.files?.[0]);e.currentTarget.value='';}}/>
     </label>
     <small>{sources[slot]?`${sources[slot]!.name} · ${fmt(sources[slot]!.duration)}`:'No file loaded'}</small>
   </div>)}</div>
   <div className="beat-readout"><b>Mixed output</b><span>{durationLabel}</span></div>
   <div className="music-mix-controls">{fields.map(({key,title,min,max,step})=><label className="field" key={key}>{title}
     <input type="number" min={min} max={max} step={step} value={mix[key]}
       onChange={e=>setMix(m=>({...m,[key]:Number(e.target.value)}))} />
   </label>)}</div>
   <div className="beat-action-pair">
     <button className="btn outline" disabled={busy||!sources.a||!sources.b} onClick={()=>void play()}>{playing?'■ Stop preview':'▶ Play mix'}</button>
     <button className="btn outline" disabled={busy} onClick={()=>{stop();setMix(DEFAULT_MIX);setStatus('Mix controls reset. Uploaded tracks are still available.')}}>Reset mix</button>
   </div>
   <button className="btn primary full" disabled={busy||!sources.a||!sources.b} onClick={()=>void render(true)}>{busy?'Rendering…':'⚡ Use Mashup in Video Studio'}</button>
   <button className="btn outline full" disabled={busy||!sources.a||!sources.b} onClick={()=>void render(false)}>↓ Download 16-bit stereo WAV</button>
   <p role="status" className="muted detail">{status}</p>
   <p className="muted detail">Limits: two local tracks, 180-second maximum mix, 44.1 kHz WAV. Speed changes pitch. This is not a full DAW or multistem separator. Only mix/redistribute music with appropriate rights; royalty-free does not mean copyright-free.</p>
 </div>;
}

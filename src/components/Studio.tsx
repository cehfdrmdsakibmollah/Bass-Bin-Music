'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import Link from 'next/link';
import {applyTemplate,createProject,templates} from '@/lib/templates';
import {drawFrame,type MediaCanvasAsset} from '@/lib/render';
import {checkFile,dimensions,formatSeconds,getExportMime} from '@/lib/media';
import {clampTime,moveTrack,patchTrack} from '@/lib/project';
import {evaluateMotion,removeKeyframe,snapTime,splitTrack,upsertKeyframe} from '@/lib/advanced';
import {analyzePCM,type AudioInsights} from '@/lib/audio-analysis';
import {detectBeats,generateTempoGrid,beatMarkersCSV,addManualBeat,removeNearestBeat,nudgeBeatMap,alignedBeats,autoMontage,addDropTitles,emptyMap,type BeatMap,type BeatStyle} from '@/lib/beat-sync';
import {loadAsset,loadProject,saveAsset,saveProject} from '@/lib/storage';
import {analyzeArrangement,autoDirector,generateMotion,quantizeBeatMap,quantizeTimeline,rippleMove,captionsSRT,editDecisionCSV,audioGainAt,type DirectorOptions,type MotionPreset} from '@/lib/director';
import type {StudioProject,Track,TrackKind,Settings,Motion} from '@/lib/types';
import {suggestHooks,applyShortHook,resizeComposition,joinNextAudio,restartPosition,MAX_COMPOSITION_SECONDS} from '@/lib/shorts';
import {convertToInstagramMp4} from '@/lib/instagram-export';
import PhonkMusicLab from '@/components/PhonkMusicLab';
import {PHONK_FX_PRESETS,applyPhonkFx} from '@/lib/phonk-fx';
import {AURA_PRESETS,previewTemplateSettings,commitTemplateChoice} from '@/lib/ultra-aura';

type Panel='assets'|'templates'|'effects'|'beats'|'inspector'|'director'|'shorts'|'music'|'fxlab'|'discover';
const PANELS:Panel[]=['assets','music','shorts','templates','fxlab','beats','director','effects','discover','inspector'];
const PANEL_ICON:Record<Panel,string>={assets:'▣',music:'♫',shorts:'▯',templates:'❖',fxlab:'✦',beats:'♩',director:'⚡',effects:'✴',discover:'⌕',inspector:'☷'};
const icon:Record<TrackKind,string>={audio:'♫',image:'▣',video:'▶',text:'T',visualizer:'▥',effect:'✦'};
function setVideoPlaybackRate(element:HTMLVideoElement,rate:number){element.playbackRate=rate;}
function setVideoCurrentTime(element:HTMLVideoElement,seconds:number){element.currentTime=seconds;}
function clockNow(){return performance.now();}
function wallNow(){return Date.now();}
function parseUpload(kind:'audio'|'image'|'video',file:File):Track{
  return {id:`track-${crypto.randomUUID()}`,kind,label:file.name.slice(0,35),start:0,duration:20,hidden:false,muted:false,assetId:`asset-${crypto.randomUUID()}`};
}
export default function Studio(){
  const [project,setProject]=useState<StudioProject>(()=>createProject());
  const projectRef=useRef(project);
  const history=useRef<{past:StudioProject[],future:StudioProject[]}>({past:[],future:[]});
  const [historyStats,setHistoryStats]=useState({undo:0,redo:0});
  const [panel,setPanel]=useState<Panel>('assets');
  const [mobileSheet,setMobileSheet]=useState<'closed'|'tools'|'export'>('closed');
  const [previewTemplate,setPreviewTemplate]=useState<string|null>(null);
  const previewTemplateRef=useRef<string|null>(null);
  const [templateCategory,setTemplateCategory]=useState('All');
  const [hookLength,setHookLength]=useState<15|30|60>(15);
  const [fxScope,setFxScope]=useState<'selected'|'all'>('all');
  const [trendQuery,setTrendQuery]=useState('brazilian phonk');
  const [sourceMap,setSourceMap]=useState<BeatMap|null>(null);
  const [sourceSeconds,setSourceSeconds]=useState(0);
  const [trimIn,setTrimIn]=useState(0);
  const [trimOut,setTrimOut]=useState(20);
  const [loopPreview,setLoopPreview]=useState(false);
  const loopRef=useRef(false);
  const [insights,setInsights]=useState<AudioInsights|null>(null);
  const [snapEnabled,setSnapEnabled]=useState(true);
  const [beatsPerCut,setBeatsPerCut]=useState<1|2|4|8>(2);
  const [montageTransition,setMontageTransition]=useState<'none'|'fade'|'slide'|'zoom'>('zoom');
  const [dropCaption,setDropCaption]=useState('BASS DROP');
  const [directorFocus,setDirectorFocus]=useState<DirectorOptions['focus']>('all');
  const [directorStrength,setDirectorStrength]=useState(.28);
  const [directorMotion,setDirectorMotion]=useState<MotionPreset>('punch');
  const [quantizeDivision,setQuantizeDivision]=useState<1|2|4>(2);
  const [quantizeTightness,setQuantizeTightness]=useState(100);
  const [rippleSeconds,setRippleSeconds]=useState(.5);
  const tappedTimes=useRef<number[]>([]);
  const [tappedBpm,setTappedBpm]=useState<number|null>(null);
  const [dragState,setDragState]=useState<{id:string,start:number}|null>(null);
  const dragRef=useRef<{id:string,x:number,start:number,width:number,next:number}|null>(null);
  const [selected,setSelected]=useState<string>('visualizer');
  const [playing,setPlaying]=useState(false);
  const [position,setPosition]=useState(0);
  const playRef=useRef({playing:false,base:0,at:0});
  const positionRef=useRef(0);
  const [saved,setSaved]=useState('Stored locally');
  const [warning,setWarning]=useState('');
  const [exporting,setExporting]=useState(false);
  const [exportPercent,setExportPercent]=useState(0);
  const [codec,setCodec]=useState('');
  const [exportPreset,setExportPreset]=useState<'instagram'|'webm'>('instagram');
  const [conversionPercent,setConversionPercent]=useState<number|null>(null);
  const [conversionRunning,setConversionRunning]=useState(false);
  const recorder=useRef<MediaRecorder|null>(null);
  const stopExport=useRef<(()=>void)|null>(null);
  const cancelRequested=useRef(false);
  const canvas=useRef<HTMLCanvasElement|null>(null);
  const audio=useRef<HTMLAudioElement|null>(null);
  const audioCtx=useRef<AudioContext|null>(null);
  const analyser=useRef<AnalyserNode|null>(null);
  const streamOut=useRef<MediaStreamAudioDestinationNode|null>(null);
  const monitorGain=useRef<GainNode|null>(null);
  const eqNodes=useRef<{low:BiquadFilterNode,mid:BiquadFilterNode,high:BiquadFilterNode,compressor:DynamicsCompressorNode}|null>(null);
  const lastMediaSync=useRef(0);
  const objectUrls=useRef<Map<string,string>>(new Map());
  const media=useRef<Map<string,MediaCanvasAsset>>(new Map());
  const raf=useRef(0);
  const drawData=useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(512));
  const [mediaReady,setMediaReady]=useState(0);
  const [ready,setReady]=useState(false);
  const [browserExport,setBrowserExport]=useState(false);
  const active=project.tracks.find(t=>t.id===selected);
  const activeMotion=active?evaluateMotion(active,position):null;
  const hasKeyframe=active?.keyframes?.some(k=>Math.abs(k.at-(position-active.start))<.05)||false;
  const audioTrack=project.tracks.find(t=>t.kind==='audio'&&t.assetId);
  const activeBeats=useMemo(()=>alignedBeats(project.beatSync,project.duration),[project.beatSync,project.duration]);
  const hooks=useMemo(()=>suggestHooks(sourceMap||project.beatSync?.map,sourceSeconds||audioTrack?.sourceDuration||project.duration,hookLength),[sourceMap,sourceSeconds,audioTrack?.sourceDuration,project.beatSync?.map,project.duration,hookLength]);
  // Limit thousands of per-layer marker DOM nodes on phones; analysis remains full-resolution.
  const timelineMarks=useMemo(()=>{
    const interval=Math.max(1,Math.ceil(activeBeats.length/52));
    return activeBeats.filter((b,i)=>b.drop||i%interval===0).slice(0,72);
  },[activeBeats]);
  const beatDrops=activeBeats.filter(e=>e.drop).length;
  const sections=useMemo(()=>analyzeArrangement(project),[project.beatSync,project.duration]);
  const visual=project.tracks.some(t=>t.kind==='visualizer'&&!t.hidden);
  const picture=project.tracks.some(t=>(t.kind==='image'||t.kind==='video')&&t.assetId);
  const commit=useCallback((patch:(p:StudioProject)=>StudioProject)=>{
    const old=projectRef.current,next=patch(old);
    if(old===next)return;
    history.current.past.push(old);
    if(history.current.past.length>50)history.current.past.shift();
    history.current.future=[];
    projectRef.current=next;setProject(next);setHistoryStats({undo:history.current.past.length,redo:0});setSaved('Unsaved changes');
  },[]);
  const jump=useCallback((redo=false)=>{
    const group=history.current,from=redo?group.future:group.past,to=redo?group.past:group.future;
    const value=from.pop();if(!value)return;
    to.push(projectRef.current);projectRef.current=value;setProject(value);setHistoryStats({undo:group.past.length,redo:group.future.length});
  },[]);
  const attachAsset=useCallback(async(id:string):Promise<BeatMap|null>=>{
    const entry=await loadAsset(id);
    if(!entry)return null;
    const previous=objectUrls.current.get(id);if(previous)URL.revokeObjectURL(previous);
    const url=URL.createObjectURL(entry.file);objectUrls.current.set(id,url);
    let detected:BeatMap|null=null;
    if(entry.kind==='audio'&&audio.current){
      audio.current.onloadedmetadata=()=>{
        const dur=audio.current?.duration;
        if(!dur||!Number.isFinite(dur))return;
        const total=Math.min(MAX_COMPOSITION_SECONDS,dur);
        setSourceSeconds(total);setTrimOut(v=>v===20?total:v);
        const match=projectRef.current.tracks.find(t=>t.kind==='audio'&&t.assetId===id);
        if(match&&!match.sourceDuration){
          commit(p=>{
            const original=p.tracks.find(t=>t.id===match.id);
            if(!original||original.sourceDuration)return p;
            const expanded=p.duration===20&&original.clipStart===undefined?resizeComposition(p,total):p;
            return {...expanded,tracks:expanded.tracks.map(t=>t.id===match.id?{...t,sourceDuration:total,...(p.duration===20&&!t.clipStart?{duration:total}:{})}:t)};
          });
        }
      };
      audio.current.src=url;audio.current.load();
      setInsights(null);
      // Skip memory-heavy decoding; video export continues to work without beat analysis.
      if(entry.file.size<=35*1024*1024){
        try{
          const context=new AudioContext();
          try{const decoded=await context.decodeAudioData(await entry.file.arrayBuffer());
            const channel=decoded.getChannelData(0);
            setInsights(analyzePCM(channel,decoded.sampleRate));
            detected=detectBeats(channel,decoded.sampleRate);
            setSourceMap(detected);setSourceSeconds(Math.min(MAX_COMPOSITION_SECONDS,decoded.duration));
            setTrimOut(Math.min(MAX_COMPOSITION_SECONDS,decoded.duration));
            if(projectRef.current.tracks.some(t=>t.kind==='audio'&&t.assetId===id)&&!projectRef.current.beatSync){
              commit(p=>({...p,beatSync:{enabled:true,style:'drift',intensity:70,offset:0,map:detected!},updatedAt:Date.now()}));
            }
          }finally{await context.close();}
        }catch{setWarning('Audio loaded; waveform/BPM analysis unavailable for this codec.');}
      }
    }
    if(entry.kind==='image'){
      const img=new Image();img.onload=()=>{media.current.set(id,img);setMediaReady(v=>v+1)};img.src=url;
    }
    if(entry.kind==='video'){
      const v=document.createElement('video');v.src=url;v.muted=true;v.playsInline=true;v.preload='auto';v.onloadeddata=()=>{media.current.set(id,v);setMediaReady(x=>x+1)};v.load();
    }
    return detected;
  },[commit,setWarning]);
  useEffect(()=>{
    let live=true;
    const capabilityTimer=setTimeout(()=>{if(live)setBrowserExport(typeof HTMLCanvasElement!=='undefined'&&!!HTMLCanvasElement.prototype.captureStream&&!!getExportMime());},0);
    const restore=async()=>{
      try{
        const params=new URLSearchParams(location.search);
        const requestedTemplate=params.get('template');
        const id=params.get('id')||(requestedTemplate?null:localStorage.getItem('bbm-last-project'));
        if(id){const found=await loadProject(id);if(live&&found){projectRef.current=found;setProject(found);setSelected(found.tracks[0]?.id||'visualizer');for(const t of found.tracks)if(t.assetId)await attachAsset(t.assetId);}}
        if(live&&requestedTemplate&&!params.has('id')){const styled=commitTemplateChoice(projectRef.current,requestedTemplate);if(styled!==projectRef.current){projectRef.current=styled;setProject(styled);}}
      }catch(e){if(live)setWarning(`Local storage unavailable: ${e instanceof Error?e.message:'unknown error'}`)}
      finally{if(live)setReady(true)}
    };
    void restore();
    return()=>{live=false;clearTimeout(capabilityTimer);cancelAnimationFrame(raf.current);stopExport.current?.();audioCtx.current?.close();for(const u of objectUrls.current.values())URL.revokeObjectURL(u)};
  },[attachAsset]);
  useEffect(()=>{
    if(!ready)return;
    const timeout=setTimeout(async()=>{
      try{await saveProject(project);localStorage.setItem('bbm-last-project',project.id);setSaved('Autosaved locally');}
      catch{setSaved('Storage failed — export project JSON');}
    },650);
    return()=>clearTimeout(timeout);
  },[project,ready]);
  const syncMedia=(t:number,shouldPlay:boolean)=>{
    const p=projectRef.current;
    const at=p.tracks.find(x=>x.kind==='audio'&&x.assetId&&!x.hidden&&t>=x.start&&t<x.start+x.duration);
    if(audio.current?.src){
      if(at){const expected=t-at.start+(at.clipStart||0);
        if(Number.isFinite(audio.current.duration)&&expected>=audio.current.duration){audio.current.pause();}
        else {if(Math.abs((audio.current.currentTime||0)-expected)>.19){try{audio.current.currentTime=expected;}catch{}}
          if(shouldPlay&&audio.current.paused)void audio.current.play().catch(()=>{});
          if(!shouldPlay&&!audio.current.paused)audio.current.pause();}
      }else if(!audio.current.paused)audio.current.pause();
    }
    for(const [assetId,m] of media.current){if(!(m instanceof HTMLVideoElement))continue;
      const clip=p.tracks.find(x=>x.kind==='video'&&x.assetId===assetId&&!x.hidden&&t>=x.start&&t<x.start+x.duration);
      if(clip){const rate=clip.playbackRate||1,expected=(t-clip.start)*rate+(clip.clipStart||0);
        if(Math.abs(m.playbackRate-rate)>.001)setVideoPlaybackRate(m,rate);
        if(Number.isFinite(m.duration)&&expected>=m.duration){m.pause();continue;}
        if(Math.abs((m.currentTime||0)-expected)>.23){try{setVideoCurrentTime(m,expected);}catch{}}
        if(shouldPlay&&m.paused)void m.play().catch(()=>{});
      }else if(!m.paused)m.pause();
    }
  };
  useEffect(()=>{
    const render=()=>{
      const element=canvas.current;if(!element)return;
      const p=projectRef.current;
      const d=dimensions(p.settings.aspect,p.settings.width);
      if(element.width!==d.width||element.height!==d.height){element.width=d.width;element.height=d.height;}
      const now=clockNow();let t=playRef.current.base;
      if(playRef.current.playing){
        t=playRef.current.base+(now-playRef.current.at)/1000;
        if(t>=p.duration){
          if(loopRef.current){t=0;playRef.current.base=0;playRef.current.at=now;positionRef.current=0;setPosition(0);syncMedia(0,true);}
          else {t=p.duration;playRef.current.playing=false;playRef.current.base=t;positionRef.current=t;setPosition(t);setPlaying(false);audio.current?.pause();}
        }
      }
      if(now-lastMediaSync.current>120){syncMedia(t,playRef.current.playing);lastMediaSync.current=now;}
      if(analyser.current)analyser.current.getByteFrequencyData(drawData.current);
      else drawData.current.fill(0);
      const ctx=element.getContext('2d',{alpha:false});if(ctx)drawFrame(ctx,previewTemplateRef.current?previewTemplateSettings(p,previewTemplateRef.current):p.settings,p.tracks,drawData.current,t,media.current,p.beatSync);
      if(playRef.current.playing&&Math.abs(positionRef.current-t)>.09){positionRef.current=t;setPosition(t);}
      raf.current=requestAnimationFrame(render);
    };
    raf.current=requestAnimationFrame(render);return()=>cancelAnimationFrame(raf.current);
  },[mediaReady]);
  const seek=(value:number)=>{
    const t=clampTime(value,projectRef.current.duration);playRef.current.base=t;playRef.current.at=clockNow();positionRef.current=t;setPosition(t);
    syncMedia(t,playRef.current.playing);
  };
  const ensureAudio=async()=>{
    if(audioCtx.current){await audioCtx.current.resume();return;}
    if(!audio.current||!audio.current.src)return;
    const ctx=new AudioContext();const src=ctx.createMediaElementSource(audio.current);
    const meter=ctx.createAnalyser();meter.fftSize=1024;meter.smoothingTimeConstant=.85;
    const output=ctx.createMediaStreamDestination(),gain=ctx.createGain();
    const low=ctx.createBiquadFilter(),mid=ctx.createBiquadFilter(),high=ctx.createBiquadFilter(),compressor=ctx.createDynamicsCompressor();
    low.type='lowshelf';low.frequency.value=180;
    mid.type='peaking';mid.frequency.value=1100;mid.Q.value=.8;
    high.type='highshelf';high.frequency.value=4800;
    src.connect(low);low.connect(mid);mid.connect(high);high.connect(meter);meter.connect(gain);gain.connect(compressor);
    compressor.connect(ctx.destination);compressor.connect(output);
    audioCtx.current=ctx;analyser.current=meter;streamOut.current=output;monitorGain.current=gain;
    eqNodes.current={low,mid,high,compressor};
    updateAudioProcessing();
    await ctx.resume();
  };
  const updateAudioProcessing=()=>{
    const p=projectRef.current,track=p.tracks.find(t=>t.kind==='audio'&&!t.hidden&&positionRef.current>=t.start&&positionRef.current<t.start+t.duration);
    if(monitorGain.current){const live=track&&!track.hidden&&positionRef.current>=track.start&&positionRef.current<track.start+track.duration;
      monitorGain.current.gain.value=live?audioGainAt(track,positionRef.current):0;}
    if(eqNodes.current){const e=p.settings.eq||{bass:0,mid:0,treble:0,compressor:false};
      eqNodes.current.low.gain.value=e.bass;eqNodes.current.mid.gain.value=e.mid;eqNodes.current.high.gain.value=e.treble;
      eqNodes.current.compressor.ratio.value=e.compressor?3:1;
      eqNodes.current.compressor.threshold.value=e.compressor?-21:0;
    }
  };
  useEffect(()=>{updateAudioProcessing();},[project.tracks,project.settings.eq,position]);
  const togglePlay=async()=>{
    if(playRef.current.playing){playRef.current.playing=false;playRef.current.base=positionRef.current;setPlaying(false);audio.current?.pause();for(const m of media.current.values())if(m instanceof HTMLVideoElement)m.pause();return;}
    try{
      if(restartPosition(positionRef.current,projectRef.current.duration)===0)seek(0);
      await ensureAudio();
      playRef.current={playing:true,base:positionRef.current,at:clockNow()};syncMedia(positionRef.current,true);setPlaying(true);
    }catch(e){setWarning(`Playback was blocked: ${e instanceof Error?e.message:'unsupported format'}`)}
  };
  const upload=async(kind:'audio'|'image'|'video',file:File|null|undefined)=>{
    if(!file)return;
    try{
      checkFile(file,kind);
      const track=parseUpload(kind,file);
      await saveAsset({id:track.assetId!,kind,name:file.name,file});
      const beatMap=await attachAsset(track.assetId!);
      const sourceDuration=beatMap?.duration||(audio.current&&Number.isFinite(audio.current.duration)?audio.current.duration:20);
      commit(p=>{
        const length=kind==='audio'?Math.min(MAX_COMPOSITION_SECONDS,Math.max(1,sourceDuration)):p.duration;
        const base=kind==='audio'?resizeComposition(p,length):p;
        const tracks=kind==='audio'?base.tracks.filter(x=>x.kind!=='audio'):[...base.tracks];
        return {...base,updatedAt:Date.now(),tracks:[{...track,duration:length,...(kind==='audio'?{sourceDuration:length}: {})},...tracks],
          ...(kind==='audio'?{beatSync:beatMap?{enabled:true,style:'drift' as const,intensity:70,offset:0,map:beatMap}:undefined}: {})};
      });
      if(kind==='audio'){setSourceSeconds(Math.min(MAX_COMPOSITION_SECONDS,sourceDuration));setTrimIn(0);setTrimOut(Math.min(MAX_COMPOSITION_SECONDS,sourceDuration));setPanel('shorts');}
      setSelected(track.id);setWarning(`${file.name} added. Media stays on this device.`);
    }catch(e){setWarning(e instanceof Error?e.message:'Could not open media');}
  };
  const setSetting=<K extends keyof Settings>(key:K,value:Settings[K])=>commit(p=>({...p,updatedAt:Date.now(),settings:{...p.settings,[key]:value}}));
  const edit=(changes:Partial<Track>)=>{if(active)commit(p=>patchTrack(p,active.id,changes));};
  const setEQ=(key:'bass'|'mid'|'treble'|'compressor',value:number|boolean)=>commit(p=>({...p,settings:{...p.settings,eq:{bass:0,mid:0,treble:0,compressor:false,...p.settings.eq,[key]:value}}}));
  const editMotion=(key:keyof Motion,value:number)=>{
    if(!active)return;
    commit(p=>patchTrack(p,active.id,hasKeyframe?
      {keyframes:upsertKeyframe(active,position,{...activeMotion,[key]:value}).keyframes}:
      {motion:{...active.motion,[key]:value}}));
  };
  const addKeyframe=()=>{if(active&&active.kind!=='audio')commit(p=>patchTrack(p,active.id,{keyframes:upsertKeyframe(active,position,activeMotion||{}).keyframes}));};
  const delKeyframe=()=>{if(active)commit(p=>patchTrack(p,active.id,{keyframes:removeKeyframe(active,position).keyframes}));};
  const splitAtPlayhead=()=>{
    if(!active)return;
    const id=`track-${crypto.randomUUID()}`;
    const before=projectRef.current;
    const next=splitTrack(before,active.id,positionRef.current,id);
    if(next===before){setWarning('Move the playhead inside a clip before splitting.');return;}
    commit(()=>next);setSelected(id);
  };
  const addShort=(start:number,end:number,shorts=true,arrange=false)=>{
    const p=projectRef.current,source=p.tracks.find(t=>t.kind==='audio'&&t.assetId);
    if(!source?.assetId){setWarning('Import a song before creating a Shorts cut.');return;}
    const trimmed=applyShortHook(p,source.assetId,start,end,sourceMap);
    const next=arrange?autoDirector(trimmed,{beatsPerCut,transition:montageTransition,motion:directorMotion,focus:directorFocus,minStrength:directorStrength,maxClips:58}):trimmed;
    if(next===p){setWarning('Invalid audio range; select a shorter interval inside your song.');return;}
    commit(()=>shorts?next:{...next,settings:p.settings});
    setSelected(source.id);setTrimIn(start);setTrimOut(end);seek(0);
    setWarning(`Applied ${(end-start).toFixed(1)}s ${shorts?'vertical Shorts':'manual'} crop. Undo restores the prior timeline.`);
  };
  const joinAudio=()=>{
    const p=projectRef.current,clip=p.tracks.find(t=>t.id===selected&&t.kind==='audio');
    if(!clip){setWarning('Select an audio segment to join with the following segment.');return;}
    const next=joinNextAudio(p,clip.id);
    if(next===p){setWarning('No matching next audio clip or not enough timeline room.');return;}
    commit(()=>next);setWarning('Audio clips joined or aligned on the timeline; Undo is available.');
  };
  const restoreFull=()=>{
    const p=projectRef.current,source=p.tracks.find(t=>t.kind==='audio'&&t.assetId);
    if(!source?.assetId){setWarning('Import audio first.');return;}
    const total=Math.min(MAX_COMPOSITION_SECONDS,sourceSeconds||source.sourceDuration||p.duration);
    const expanded=resizeComposition(p,total);
    const tracks=[{...source,start:0,clipStart:0,duration:total,sourceDuration:total,fadeIn:0,fadeOut:0},...expanded.tracks.filter(t=>t.kind!=='audio')];
    commit(()=>({...expanded,tracks,beatSync:sourceMap&&p.beatSync?{...p.beatSync,map:sourceMap}:p.beatSync}));
    setTrimIn(0);setTrimOut(total);setSelected(source.id);seek(0);
    setWarning('Full song timeline restored. Undo restores the previous cut.');
  };
  const markRange=(point:'in'|'out')=>{
    const a=projectRef.current.tracks.find(t=>t.kind==='audio'&&t.start<=positionRef.current&&t.start+t.duration>=positionRef.current);
    const at=Math.round(((a?.clipStart||0)+positionRef.current-(a?.start||0))*100)/100;
    if(point==='in')setTrimIn(Math.max(0,at));else setTrimOut(Math.min(sourceSeconds||MAX_COMPOSITION_SECONDS,at));
  };
  const capturePng=()=>{
    if(!canvas.current)return;
    canvas.current.toBlob(blob=>{if(blob)download(blob,`bass-bin-frame-${Math.round(positionRef.current*100)/100}.png`);else setWarning('PNG capture unavailable.');},'image/png');
  };
  const onDragStart=(e:PointerEvent<HTMLButtonElement>,t:Track)=>{
    if(e.button!==0)return;
    const lane=e.currentTarget.parentElement?.getBoundingClientRect();if(!lane)return;
    dragRef.current={id:t.id,x:e.clientX,start:t.start,width:lane.width,next:t.start};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove=(e:PointerEvent<HTMLButtonElement>)=>{
    const d=dragRef.current;if(!d||d.id!==e.currentTarget.dataset.track)return;
    const t=projectRef.current.tracks.find(x=>x.id===d.id);if(!t)return;
    const raw=Math.max(0,Math.min(projectRef.current.duration-t.duration,d.start+(e.clientX-d.x)/d.width*projectRef.current.duration));
    const snapped=snapEnabled&&projectRef.current.beatSync?snapTime(raw,alignedBeats(projectRef.current.beatSync,projectRef.current.duration).map(b=>b.at),.15):raw;
    const at=Math.max(0,Math.min(projectRef.current.duration-t.duration,snapped));
    d.next=Math.round(at*100)/100;setDragState({id:d.id,start:d.next});
  };
  const onDragEnd=(e:PointerEvent<HTMLButtonElement>)=>{
    const d=dragRef.current;if(!d)return;dragRef.current=null;
    if(Math.abs(d.start-d.next)>.01)commit(p=>patchTrack(p,d.id,{start:d.next}));
    setDragState(null);
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const addText=()=>{
    const id=`track-${crypto.randomUUID()}`;
    commit(p=>({...p,tracks:[...p.tracks,{id,kind:'text',label:'New text',text:'YOUR TEXT',transition:'fade',motion:{y:30},start:0,duration:p.duration,hidden:false,muted:false}]}));
    setSelected(id);openMobilePanel('inspector');
  };
  const duplicate=()=>{
    if(!active)return;
    const id=`track-${crypto.randomUUID()}`;
    commit(p=>({...p,tracks:[...p.tracks,{...active,id,label:`${active.label} copy`}]}));setSelected(id);
  };
  const remove=()=>{
    if(!active)return;
    commit(p=>({...p,tracks:p.tracks.filter(t=>t.id!==active.id)}));setSelected('visualizer');
  };
  const exportJson=()=>{
    const data=new Blob([JSON.stringify(project,null,2)],{type:'application/json'});
    download(data,'bass-bin-project.json');
  };
  const importJson=async(f:File|null|undefined)=>{
    if(!f)return;
    try{
      const json=JSON.parse(await f.text()) as StudioProject;
      const {normalizeProject}=await import('@/lib/project');
      const value=normalizeProject(json);
      if(!value)throw Error('Invalid project JSON or schema version');
      commit(()=>({...value,id:`bbm-${Date.now()}`,name:`${value.name} (imported)`,updatedAt:Date.now()}));
      setWarning('Project metadata imported. Original media must exist in this browser to be restored.');
    }catch(e){setWarning(e instanceof Error?e.message:'Import failed')}
  };
  const convertExistingVideo=async(file:File|null|undefined)=>{
    if(!file||conversionRunning||exporting)return;
    setConversionRunning(true);setConversionPercent(0);
    setWarning('Encoding Instagram MP4 on this device. Keep the page open.');
    try{
      const converted=await convertToInstagramMp4(file,setConversionPercent);
      const filename=(file.name.replace(/\.(webm|mp4|mov)$/i,'')||'bass-bin-video')+'-instagram.mp4';
      download(converted,filename);
      setWarning('Instagram MP4 downloaded (H.264 video / AAC audio).');
    }catch(e){
      setWarning('MP4 conversion failed: '+(e instanceof Error?e.message:'Unsupported browser codec')+'. Try desktop Chrome or Edge.');
    }finally{setConversionRunning(false);setConversionPercent(null);}
  };
  const doExport=async()=>{
    if(previewTemplateRef.current){setWarning('Apply or cancel your template preview before export.');setPanel('templates');return;}
    if(exporting||conversionRunning||!canvas.current)return;
    const mime=getExportMime();
    if(!mime||!canvas.current.captureStream){setWarning('This browser does not support native canvas video export. Try desktop Chrome or Edge.');return;}
    cancelRequested.current=false;setWarning('');setExportPercent(0);
    let stream:MediaStream|null=null, timer:ReturnType<typeof setInterval>|null=null;
    try{
      audio.current?.pause();seek(0);
      await ensureAudio();
      const p=projectRef.current;
      const nativeStream=canvas.current.captureStream(p.settings.fps);
      stream=new MediaStream([...nativeStream.getVideoTracks(),...(streamOut.current?.stream.getAudioTracks()||[])]);
      const chunks:Blob[]=[];
      const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:(p.settings.bitrate||5)*1_000_000});recorder.current=rec;
      const start=clockNow();
      rec.ondataavailable=(e)=>{if(e.data.size>0)chunks.push(e.data)};
      rec.onerror=()=>setWarning('Browser recording failed. Try a shorter duration or lower resolution.');
      rec.onstop=async()=>{
        if(timer)clearInterval(timer);
        stream?.getVideoTracks().forEach(t=>t.stop());
        audio.current?.pause();playRef.current.playing=false;setPlaying(false);stopExport.current=null;
        try{
          if(cancelRequested.current){setWarning('Export cancelled.');return;}
          if(!chunks.length){setWarning('No video frames were produced. Please try another browser.');return;}
          const raw=new Blob(chunks,{type:mime});
          const ext=mime.includes('mp4')?'mp4':'webm';
          if(exportPreset==='webm'){
            download(raw,`bass-bin-${Date.now()}.${ext}`);
            setWarning(`Export saved to your device as ${ext.toUpperCase()}.`);return;
          }
          setConversionRunning(true);setConversionPercent(0);
          setWarning('Rendering finished. Encoding Instagram MP4 locally; keep this page open.');
          try{
            const mp4=await convertToInstagramMp4(raw,setConversionPercent);
            download(mp4,`bass-bin-instagram-${Date.now()}.mp4`);
            setWarning('Instagram-ready MP4 saved: H.264 video, AAC audio, 30 FPS.');
          }catch(e){
            download(raw,`bass-bin-backup-${Date.now()}.${ext}`);
            setWarning(`MP4 conversion unavailable in this browser: ${e instanceof Error?e.message:'codec unsupported'}. Recording saved as ${ext.toUpperCase()} backup; try desktop Chrome/Edge.`);
          }
        }finally{setConversionRunning(false);setConversionPercent(null);setExporting(false);}
      };
      stopExport.current=()=>{cancelRequested.current=true;if(rec.state!=='inactive')rec.stop()};
      setExporting(true);setCodec(mime);
      rec.start(250);
      playRef.current={playing:true,base:0,at:start};syncMedia(0,true);setPlaying(true);
      timer=setInterval(()=>{
        const elapsed=(clockNow()-start)/1000;
        setExportPercent(Math.min(100,Math.round(elapsed/p.duration*100)));
        if(elapsed>=p.duration){if(rec.state!=='inactive')rec.stop();}
      },100);
    }catch(e){
      if(timer)clearInterval(timer);
      stream?.getVideoTracks().forEach(t=>t.stop());
      if(recorder.current?.state==='recording'){cancelRequested.current=true;recorder.current.stop();}
      setExporting(false);stopExport.current=null;
      setWarning(`Export could not start: ${e instanceof Error?e.message:'unknown browser error'}`);
    }
  };
  const changeSync=(patch:Partial<NonNullable<StudioProject['beatSync']>>)=>commit(p=>({
    ...p,updatedAt:Date.now(),beatSync:{
      enabled:true,style:'drift',intensity:70,offset:0,map:emptyMap(p.duration),...p.beatSync,...patch
    }
  }));
  const tapTempo=()=>{
    const now=clockNow();
    const taps=tappedTimes.current;
    if(taps.length&&now-taps[taps.length-1]>2200)taps.length=0;
    taps.push(now);if(taps.length>8)taps.shift();
    if(taps.length>=4){
      const intervals=taps.slice(1).map((at,i)=>at-taps[i]).filter(ms=>ms>245&&ms<1200).sort((a,b)=>a-b);
      if(intervals.length>=3){const bpm=Math.round(60000/intervals[Math.floor(intervals.length/2)]);
        if(bpm>=50&&bpm<=240)setTappedBpm(bpm);
      }
    }
  };
  const useTappedGrid=()=>{
    if(!tappedBpm){setWarning('Tap the tempo at least four times first.');return;}
    if(projectRef.current.beatSync?.map.events.length&&!confirm('Replace current analyzed beat markers with your tapped tempo grid? Undo restores them.'))return;
    changeSync({enabled:true,offset:0,map:generateTempoGrid(projectRef.current.duration,tappedBpm,positionRef.current)});
    setWarning(`Generated an editable ${tappedBpm} BPM rhythm grid; check synchronization by ear.`);
  };
  const exportBeatsCSV=()=>download(new Blob([beatMarkersCSV(projectRef.current.beatSync,projectRef.current.duration)],{type:'text/csv;charset=utf-8'}),'bass-bin-beat-markers.csv');
  const addBeatHere=()=>{const at=positionRef.current;changeSync({map:addManualBeat(projectRef.current.beatSync?.map||emptyMap(projectRef.current.duration),at)});};
  const removeBeatHere=()=>{
    const map=projectRef.current.beatSync?.map;if(!map)return;
    const value=removeNearestBeat(map,positionRef.current,.3);
    if(value===map){setWarning('No beat found within ±0.3 seconds of the playhead.');return;}
    changeSync({map:value});
  };
  const shiftBeats=(amount:number)=>{const sync=projectRef.current.beatSync;if(!sync)return;
    changeSync({map:nudgeBeatMap(sync.map,amount)});
  };
  const runMontage=()=>{
    const p=projectRef.current;
    if(p.tracks.filter(t=>(t.kind==='image'||t.kind==='video')&&t.assetId).length===0){
      setWarning('Add one or more images or video clips before using Auto Montage.');return;
    }
    if(alignedBeats(p.beatSync,p.duration).length<2){setWarning('Import audio and detect at least 2 beats, or add beats manually.');return;}
    if(!confirm('Auto Montage will replace your current image/video clip arrangement (your media stays intact). Use Undo to restore. Continue?'))return;
    const edited=autoMontage(p,{beatsPerCut,transition:montageTransition,maxClips:58});
    if(edited===p){setWarning('Could not create montage from these beat markers.');return;}
    commit(()=>edited);setSelected(edited.tracks.find(t=>t.id.startsWith('montage-'))?.id||'visualizer');
    setWarning(`Created ${edited.tracks.filter(t=>t.id.startsWith('montage-')).length} beat-aligned cuts. Undo can restore the arrangement.`);
  };
  const applyDirector=()=>{
    const p=projectRef.current;
    if(!p.tracks.some(t=>(t.kind==='image'||t.kind==='video')&&t.assetId)){setWarning('Import two or more photos/video assets for the best Auto Director results.');return;}
    const settings:DirectorOptions={beatsPerCut,transition:montageTransition,motion:directorMotion,focus:directorFocus,minStrength:directorStrength,maxClips:58};
    const edited=autoDirector(p,settings);
    if(edited===p){setWarning('No eligible music beats. Try reducing minimum strength, selecting All bands or adding manual beat markers.');return;}
    if(!confirm('AI-free Auto Director will replace the image/video timeline with rhythm-synced cuts. Undo can restore the original. Continue?'))return;
    commit(()=>edited);setSelected(edited.tracks.find(t=>t.id.startsWith('director-'))?.id||'visualizer');
    setWarning(`Auto Director prepared ${edited.tracks.filter(t=>t.id.startsWith('director-')).length} editable clips. Review video trim and timing before exporting.`);
  };
  const applySelectedMotion=()=>{
    if(!active||active.kind==='audio'){setWarning('Select an image, video or text layer to animate.');return;}
    commit(p=>patchTrack(p,active.id,{keyframes:generateMotion(active,directorMotion,80).keyframes}));
    setPanel('inspector');setWarning(`Applied ${directorMotion} keyframe choreography. Use Undo to restore.`);
  };
  const rhythmQuantize=()=>{
    const p=projectRef.current,beat=p.beatSync;
    if(!beat?.map.bpm){setWarning('Set a manual BPM using Tap Tempo or import an analyzable song first.');return;}
    changeSync({map:quantizeBeatMap(beat.map,quantizeDivision,0,quantizeTightness/100)});
    setWarning(`Beat markers quantized to 1/${quantizeDivision} subdivisions; Undo is available.`);
  };
  const quantizeClips=(scope:'selected'|'all')=>{
    const next=quantizeTimeline(projectRef.current,scope,selected,.28);
    if(next===projectRef.current){setWarning('No clips within 280 ms of a beat.');return;}
    commit(()=>next);setWarning('Clip start times snapped to nearest detected beat.');
  };
  const shiftClips=()=>{
    const next=rippleMove(projectRef.current,selected,rippleSeconds);
    if(next===projectRef.current){setWarning('Ripple move unavailable: check clip selection and timeline boundaries.');return;}
    commit(()=>next);
  };
  const jumpToMarker=(direction:-1|1,dropsOnly=false)=>{
    const events=(dropsOnly?activeBeats.filter(e=>e.drop):activeBeats);
    if(!events.length){setWarning('No beat/drop markers available.');return;}
    const now=positionRef.current;
    const match=direction>0?events.find(e=>e.at>now+.03):[...events].reverse().find(e=>e.at<now-.03);
    seek((match||events[direction>0?0:events.length-1]).at);
  };
  const saveCaptions=()=>{
    const captions=captionsSRT(projectRef.current);
    if(!captions){setWarning('Add editable text clips with captions to the timeline first.');return;}
    download(new Blob([captions],{type:'text/plain;charset=utf-8'}),'bass-bin-captions.srt');
  };
  const saveEDL=()=>download(new Blob([editDecisionCSV(projectRef.current)],{type:'text/csv;charset=utf-8'}),'bass-bin-edit-decision-list.csv');
  const addTitles=()=>{
    const p=projectRef.current,updated=addDropTitles(p,dropCaption);
    if(updated===p){setWarning('No detected drop markers or timeline room. Add beats and mark a kick as a drop first.');return;}
    commit(()=>updated);setWarning(`Added ${updated.tracks.length-p.tracks.length} drop captions.`);
  };
  const toggleDrop=()=>{
    const map=projectRef.current.beatSync?.map;if(!map?.events.length)return;
    const seconds=positionRef.current;let index=-1,best=.36;
    map.events.forEach((e,i)=>{const distance=Math.abs(e.at+(projectRef.current.beatSync?.offset||0)-seconds);if(distance<best){best=distance;index=i;}});
    if(index<0){setWarning('Move the playhead within 0.36 seconds of a beat.');return;}
    const events=map.events.map((e,i)=>i===index?{...e,drop:!e.drop}:e);
    changeSync({map:{...map,source:'manual',events}});
  };
  const reset=()=>{
    if(!confirm('Reset all project settings and timeline tracks? Your stored media files are not deleted.'))return;
    audio.current?.pause();audio.current?.removeAttribute('src');audio.current?.load();
    const empty=createProject(wallNow());commit(()=>empty);setSelected('visualizer');seek(0);
  };
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{
      const target=e.target as HTMLElement;
      if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(target.tagName)||target.isContentEditable)return;
      if(e.code==='Space'){e.preventDefault();void togglePlay();}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();jump(e.shiftKey);}
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();seek(positionRef.current+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?1:1/projectRef.current.settings.fps));}
      if(e.key.toLowerCase()==='s'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();splitAtPlayhead();}
      if(e.key.toLowerCase()==='b'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();addBeatHere();}
      if(e.key==='Delete'&&active&&active.kind!=='audio'){e.preventDefault();remove();}
    };
    window.addEventListener('keydown',down);return()=>window.removeEventListener('keydown',down);
  });
  const selectForEdit=(id:string)=>{
    setSelected(id);setPanel('inspector');
    if(typeof window!=='undefined'&&window.matchMedia('(max-width:760px)').matches)setMobileSheet('tools');
  };
  const switchPanel=(next:Panel)=>{
    if(next!=='templates'&&previewTemplateRef.current){
      previewTemplateRef.current=null;setPreviewTemplate(null);
    }
    setPanel(next);
  };
  const openMobilePanel=(next:Panel)=>{
    switchPanel(next);setMobileSheet('tools');
  };
  const openExportSheet=()=>{
    if(previewTemplateRef.current){
      setMobileSheet('tools');setPanel('templates');
      setWarning('Apply or cancel the preview before exporting.');
      return;
    }
    setMobileSheet('export');
  };
  const previewChoice=(slug:string)=>{
    previewTemplateRef.current=slug;setPreviewTemplate(slug);
    setWarning('Previewing template. Choose Apply Template or Cancel Preview.');
  };
  const cancelChoice=()=>{
    previewTemplateRef.current=null;setPreviewTemplate(null);
    setWarning('Preview cancelled. Your saved project is unchanged.');
  };
  const applyChoice=()=>{
    const slug=previewTemplateRef.current;if(!slug)return;
    commit(p=>commitTemplateChoice(p,slug));
    previewTemplateRef.current=null;setPreviewTemplate(null);
    setWarning('Template applied: '+(templates.find(t=>t.slug===slug)?.name||AURA_PRESETS.find(t=>t.slug===slug)?.title||slug)+'. Undo is available.');
    setMobileSheet('closed');
  };
  const createAuraReel=()=>{
    const original=projectRef.current;
    const music=original.tracks.find(t=>t.kind==='audio'&&t.assetId);
    const len=Math.min(15,music?.sourceDuration||15);
    const base=music?.assetId?applyShortHook(original,music.assetId,0,len,sourceMap):resizeComposition(original,15);
    const preset=commitTemplateChoice(base,'ultra-aura');
    commit(()=>({...preset,settings:{...preset.settings,aspect:'9:16',width:720,fps:30}}));
    previewTemplateRef.current=null;setPreviewTemplate(null);
    seek(0);setMobileSheet('closed');
    setWarning('Ultra Aura 9:16 Reel ready. Add your own footage/music or export.');
  };
  const range=(key:keyof Pick<Settings,'intensity'|'glow'|'shake'|'particles'|'zoom'|'vignette'|'grain'|'beatPulse'|'scanlines'|'chromatic'|'letterbox'>,title:string,max=100)=>
    <label className="slider-field" key={key}><span>{title}<strong>{project.settings[key]??0}%</strong></span><input type="range" min={0} max={max} value={project.settings[key]??0} onChange={e=>setSetting(key,Number(e.target.value))}/></label>;
  return <div className="studio-root">
    <audio ref={audio} preload="metadata" aria-hidden="true" />
    <header className="studio-header"><Link href="/" className="brand mini"><img src="/bass-bin-logo.png" alt=""/> <span>BASS BIN <em>MUSIC</em></span></Link>
      <div className="studio-file"><input aria-label="Project name" value={project.name} maxLength={70} onChange={e=>commit(p=>({...p,name:e.target.value}))}/><small>{saved}</small></div>
      <div className="header-actions"><button className="btn primary tiny mobile-export-trigger" onClick={openExportSheet}>Next →</button><button className="btn ghost tiny" onClick={exportJson} title="Export editable project settings JSON">Save JSON</button><button className="btn ghost tiny" onClick={()=>jump()} disabled={historyStats.undo===0} title="Undo (Ctrl+Z)">↶</button><button className="btn ghost tiny" onClick={()=>jump(true)} disabled={historyStats.redo===0} title="Redo">↷</button><button className="btn primary tiny" onClick={()=>void doExport()} disabled={exporting||!browserExport}>{exporting?'Rendering…':'↓ Export Video'}</button></div>
    </header>
    {mobileSheet!=='closed'&&<button className="mobile-sheet-backdrop" aria-label="Close mobile tool panel" onClick={()=>setMobileSheet('closed')}/>}
     <main className="studio-columns">
      <nav className="tool-rail" aria-label="Studio panels">{PANELS.map(p=><button key={p} aria-current={panel===p?'page':undefined} onClick={()=>switchPanel(p)} className={panel===p?'active':''}><span>{PANEL_ICON[p]}</span>{p}</button>)}</nav>
      <aside className={`studio-side ${mobileSheet==='tools'?'mobile-sheet-open':''}`} aria-label="Editor tool sheet">
       <div className="mobile-sheet-heading"><span className="sheet-grip"/><b>{panel==='fxlab'?'Phonk effects':panel==='templates'?'Templates':panel==='assets'?'Media library':panel==='music'?'Music Lab':panel==='inspector'?'Clip inspector':panel}</b><button type="button" aria-label="Close tool sheet" onClick={()=>setMobileSheet('closed')}>✕</button></div>
       <nav className="mobile-sheet-panel-chooser" aria-label="All mobile editor tools">{PANELS.map(p=><button key={p} aria-current={panel===p?'page':undefined} onClick={()=>switchPanel(p)}>{PANEL_ICON[p]} {p}</button>)}</nav>
        {panel==='assets'&&<><div className="panel-heading"><h2>Media library</h2><small>Local · private</small></div><p className="muted detail">Import your own media. Assets are stored in this browser, not uploaded to a server.</p><div className="upload-list">
          {(['audio','image','video'] as const).map(kind=><label className="upload-button" key={kind}><span>{kind==='audio'?'♫':kind==='image'?'▧':'▶'}</span><div><b>Import {kind}</b><small>{kind==='audio'?'MP3 · WAV · OGG':kind==='image'?'PNG · JPG · WebP':'MP4 · WebM'}</small></div><input type="file" hidden accept={`${kind}/*`} onChange={e=>{void upload(kind,e.target.files?.[0]);e.currentTarget.value='';}} /></label>)}
          <button className="btn outline full" onClick={async()=>{try{const r=await fetch('/demo-beat.wav');if(!r.ok)throw Error('Demo audio unavailable');const b=await r.blob();await upload('audio',new File([b],'Original Demo Beat.wav',{type:'audio/wav'}))}catch(e){setWarning(e instanceof Error?e.message:'Demo loading failed')}}}>▶ Try original demo beat</button>
        </div><div className="panel-divider"/><h3>Timeline assets</h3>{project.tracks.filter(t=>t.assetId).length===0?<p className="empty-message">Your uploaded files appear here.</p>:project.tracks.filter(t=>t.assetId).map(t=><button key={t.id} className="asset-chip" onClick={()=>{setSelected(t.id);setPanel('inspector')}}><span>{icon[t.kind]}</span>{t.label}</button>)}<div className="panel-divider"/><label className="btn outline full">↑ Import project JSON<input hidden type="file" accept="application/json,.json" onChange={e=>{void importJson(e.target.files?.[0]);e.currentTarget.value=''}} /></label></>}
        {panel==='music'&&<PhonkMusicLab onUse={async file=>{await upload('audio',file);setPanel('beats');}}/>}
        {panel==='fxlab'&&<>
          <div className="panel-heading"><h2>Phonk FX & Transitions</h2><small>Creative recipes</small></div>
          <p className="muted detail">Original beat-driven effects inspired by Phonk and Avee aesthetics; not a verified popularity ranking. Each changes live Canvas/export settings and transitions, with Undo support.</p>
          <label className="field">Apply transition to
            <select aria-label="FX target scope" value={fxScope} onChange={e=>setFxScope(e.target.value as 'selected'|'all')}>
              <option value="all">All visual/text clips</option><option value="selected">Selected visual/text clip</option>
            </select>
          </label>
          <div className="phonk-fx-grid">{PHONK_FX_PRESETS.map(fx=><button key={fx.id} className="phonk-fx-card" title={fx.description} onClick={()=>{
            const changed=applyPhonkFx(projectRef.current,fx.id,fxScope,selected);
            if(changed===projectRef.current){setWarning('Select an image/video/text clip or use All clips.');return;}
            commit(()=>changed);setWarning(`${fx.title} applied to the video. Undo is available.`);
          }}>
            <i style={{background:`linear-gradient(135deg,${fx.values.primary||'#1a88cb'},${fx.values.secondary||'#ab3fff'})`}}/>
            <span><b>{fx.title}</b><small>{fx.description}</small></span>
          </button>)}</div>
          <div className="panel-divider"/><h3>Camera motion presets</h3>
          <p className="muted detail">Animate your selected image, video or caption with editable keyframes. These render identically in preview and export.</p>
          <div className="motion-preset-buttons">
            {([{id:'punch',label:'Bass Punch'},{id:'drift',label:'Drift Push'},{id:'orbit',label:'Aura Orbit'},{id:'glide',label:'Cinema Pan'}] as const).map(item=><button className="btn outline" key={item.id} disabled={!active||!['image','video','text'].includes(active.kind)} onClick={()=>{
              if(!active)return;
              commit(p=>({...p,updatedAt:Date.now(),tracks:p.tracks.map(t=>t.id===active.id?generateMotion(t,item.id,75):t)}));
              setWarning(item.label+' keyframe animation applied. Open Inspector to edit.');
            }}>{item.label}</button>)}
          </div>
          <div className="panel-divider"/><h3>Manual clip transition</h3>
          <label className="field">Selected clip
            <select aria-label="Select transition" disabled={!active||!['image','video','text'].includes(active.kind)} value={active?.transition||'none'} onChange={e=>edit({transition:e.target.value as Track['transition']})}>
              {(['none','fade','slide','zoom','whip','glitch','spin'] as const).map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <p className="muted detail">Flashes are capped in the renderer, but sensitive viewers may still experience discomfort. Preview before publishing.</p>
        </>}
        {panel==='discover'&&<>
          <div className="panel-heading"><h2>Phonk Trend Finder</h2><small>Live source links</small></div>
          <p className="muted detail">Open source-platform music charts/searches to investigate emerging Phonk sounds. These are external discovery tools, not scraped rankings or downloadable songs.</p>
          <label className="field">Search Phonk styles
            <input aria-label="Phonk discovery query" value={trendQuery} maxLength={70} onChange={e=>setTrendQuery(e.target.value)}/>
          </label>
          <div className="phonk-discovery">
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(trendQuery+' 2026 phonk')}`} target="_blank" rel="noopener noreferrer"><b>▶ YouTube Phonk search</b><small>Explore tracks and video edits</small></a>
            <a href="https://charts.youtube.com/" target="_blank" rel="noopener noreferrer"><b>▥ Official YouTube Charts</b><small>Explore music / Shorts charts</small></a>
            <a href={`https://soundcloud.com/search/sounds?q=${encodeURIComponent(trendQuery)}`} target="_blank" rel="noopener noreferrer"><b>♫ SoundCloud search</b><small>Artist discovery; permissions vary</small></a>
            <a href={`https://pixabay.com/music/search/${encodeURIComponent(trendQuery)}/`} target="_blank" rel="noopener noreferrer"><b>✧ Pixabay music</b><small>Review track licence before use</small></a>
            <a href="https://ncs.io/usage-policy/2/types-of-content" target="_blank" rel="noopener noreferrer"><b>⚖ NCS usage policy</b><small>Pure music visualizers may be excluded</small></a>
          </div>
          <div className="panel-divider"/><h3>Copyright & remix rights</h3>
          <p className="muted detail">A trending track is not automatically free to reuse. Confirm permission for both recordings and compositions. NCS standard creator policy specifically excludes simple music visualizers/reuploads. Mixing two songs does not avoid copyright.</p>
          <button className="btn primary full" onClick={()=>openMobilePanel('music')}>♫ Open Phonk Music Lab</button>
        </>}
        {panel==='shorts'&&<>
          <div className="panel-heading"><h2>Shorts Lab</h2><small>9:16 · creator tools</small></div>
          <p className="muted detail">Suggests punchy parts of YOUR uploaded music using estimated beat intensity and drops. These are offline editing suggestions — NOT verified YouTube/TikTok trending statistics.</p>
          {!audioTrack?<p className="empty-message">Import a song from Assets to unlock candidate hooks.</p>:<>
            <div className="beat-readout"><b>Full song: {formatSeconds(sourceSeconds||audioTrack.sourceDuration||project.duration)}</b><span>Timeline: {formatSeconds(project.duration)} · {project.beatSync?.map.bpm||'—'} BPM estimated</span></div>
            <label className="field">Suggested Shorts length
              <select aria-label="Shorts clip length" value={hookLength} onChange={e=>setHookLength(Number(e.target.value) as 15|30|60)}>
                <option value={15}>15 seconds · quick hook</option><option value={30}>30 seconds · classic short</option><option value={60}>60 seconds · longer edit</option>
              </select>
            </label>
            <div className="shorts-suggestions">{hooks.map((hook,i)=><div className="shorts-suggestion" key={i}>
              <strong>#{i+1} · {formatSeconds(hook.start)}–{formatSeconds(hook.end)}</strong>
              <small>{hook.reason} · local energy score {hook.score.toFixed(2)}</small>
              <div className="beat-action-pair">
                <button className="btn outline" onClick={()=>seek(Math.min(hook.start,projectRef.current.duration))}>▶ Preview point</button>
                <button className="btn primary" onClick={()=>addShort(hook.start,hook.end)}>Use this hook</button>
              </div>
              {picture&&<button className="btn outline full" onClick={()=>addShort(hook.start,hook.end,true,true)}>⚡ Use hook + Auto Sync imported footage</button>}
            </div>)}</div>
            <div className="panel-divider"/><h3>Manual audio crop & join</h3>
            <p className="muted detail">Keep your whole song, set In/Out points manually, split at the playhead, and join adjacent segments. All operations are reversible.</p>
            <div className="beat-action-pair"><button className="btn outline" onClick={()=>markRange('in')}>Mark In at playhead</button><button className="btn outline" onClick={()=>markRange('out')}>Mark Out at playhead</button></div>
            <label className="field">Source In (seconds)<input aria-label="Shorts source in" type="number" min="0" max={sourceSeconds||MAX_COMPOSITION_SECONDS} step=".1" value={trimIn} onChange={e=>setTrimIn(Math.max(0,Number(e.target.value)||0))}/></label>
            <label className="field">Source Out (seconds)<input aria-label="Shorts source out" type="number" min="0" max={sourceSeconds||MAX_COMPOSITION_SECONDS} step=".1" value={trimOut} onChange={e=>setTrimOut(Math.max(0,Number(e.target.value)||0))}/></label>
            <button className="btn primary full" onClick={()=>addShort(trimIn,trimOut,false)}>✂ Crop source to In / Out (keep ratio)</button>
            <div className="beat-action-pair"><button className="btn outline" onClick={splitAtPlayhead} disabled={!active}>✂ Split selected layer</button><button className="btn outline" onClick={joinAudio}>⇥ Join next audio</button></div>
            <button className="btn outline full" onClick={restoreFull}>↶ Restore full song ({formatSeconds(sourceSeconds||audioTrack.sourceDuration||project.duration)})</button>
            <button className="btn outline full" onClick={()=>commit(p=>({...p,settings:{...p.settings,aspect:'9:16',width:720,fps:30}}))}>▯ Set 9:16 vertical Shorts canvas</button>
          </>}
          <div className="panel-divider"/><h3>Footage inspiration (optional)</h3>
          <p className="muted detail">Browse creator-licensed stock footage, download a clip yourself and import it from Assets. Nothing is fetched automatically. Check each clip&apos;s rights, trademarks and releases before publishing.</p>
          <div className="shorts-stock">
          {(['car drifting','neon street','night driving','smoke lights','motorcycle riding'] as const).map(term=><a className="btn outline" key={term} href={`https://www.pexels.com/search/videos/${encodeURIComponent(term)}/`} target="_blank" rel="noopener noreferrer">{term} ↗</a>)}
          </div>
        </>}
        {panel==='templates'&&<>
          <div className="panel-heading"><h2>Ultra Aura & Phonk Templates</h2><small>{templates.length+AURA_PRESETS.length} editable</small></div>
          <p className="muted detail">Preview any original theme before applying. Your timeline, uploaded media and project remain unchanged until you confirm.</p>
          <div className="template-filters" role="group" aria-label="Template categories">
            {['All','Ultra Aura','Phonk','Drift','Avee Inspired','NCS Inspired','Dark','Bass'].map(cat=><button key={cat} aria-pressed={templateCategory===cat} onClick={()=>setTemplateCategory(cat)}>{cat}</button>)}
          </div>
          {previewTemplate&&<div className="template-confirm" role="status">
            <strong>Previewing: {templates.find(t=>t.slug===previewTemplate)?.name||AURA_PRESETS.find(t=>t.slug===previewTemplate)?.title}</strong>
            <small>Look at the live preview; only Apply saves the change.</small>
            <div className="beat-action-pair"><button className="btn primary" onClick={applyChoice}>✓ Apply Template</button><button className="btn outline" onClick={cancelChoice}>✕ Cancel Preview</button></div>
          </div>}
          <div className="mini-templates mobile-template-grid">
            {AURA_PRESETS.filter(t=>templateCategory==='All'||templateCategory==='Ultra Aura').map(t=><button key={t.slug} className={`mini-template ${project.template===t.slug?'chosen':''} ${previewTemplate===t.slug?'preview-chosen':''}`} aria-pressed={previewTemplate===t.slug} onClick={()=>previewChoice(t.slug)}>
              <span className="mini-art" style={{background:`radial-gradient(circle at 50% 50%,#0a1130 13%,${t.colors[0]}ad 17%,#111630 23%,${t.colors[1]}b8 33%,#080c20 53%,${t.colors[0]}45 85%)`}}><span style={{borderColor:t.colors[0]}}/></span>
              <b>{t.title}</b><small>Ultra Aura · {t.category}</small>
            </button>)}
            {templates.filter(t=>templateCategory==='All'||t.category===templateCategory).map(t=><button key={t.slug} className={`mini-template ${project.template===t.slug?'chosen':''} ${previewTemplate===t.slug?'preview-chosen':''}`} aria-pressed={previewTemplate===t.slug} onClick={()=>previewChoice(t.slug)}>
              <span className="mini-art" style={{background:`radial-gradient(circle at 70% 32%,${t.colors[0]}6c,transparent 55%),radial-gradient(circle at 22% 75%,${t.colors[1]}7c,transparent 60%),#121424`}}><span style={{borderColor:t.colors[0]}}/></span>
              <b>{t.name}</b><small>{t.category}</small>
            </button>)}
          </div>
          {!previewTemplate&&<p className="muted detail">Tap a template, inspect the preview, then tap Apply Template to save it.</p>}
        </>}
        {panel==='beats'&&<><div className="panel-heading"><h2>Beat Sync Engine</h2><small>Phonk Auto-Edit</small></div>
          <p className="muted detail">Offline kick, snare and hi-hat transient estimates. Review timing by ear; tempo and drop detection are not guaranteed.</p>
          <div className="beat-readout"><b>{project.beatSync?.map.bpm?`≈ ${project.beatSync.map.bpm} BPM`:'Tempo unknown'}</b><span>{activeBeats.length} beats · {beatDrops} drops</span></div>
          <label className="check-row"><input type="checkbox" checked={project.beatSync?.enabled??false} onChange={e=>changeSync({enabled:e.target.checked})}/> Apply beat-driven visual FX</label>
          <label className="field">Phonk FX character<select value={project.beatSync?.style||'drift'} onChange={e=>changeSync({style:e.target.value as BeatStyle})}>
            <option value="drift">Drift Shake · camera + glitch</option><option value="hard">Hard Phonk · aggressive zoom</option><option value="cinematic">Cinematic Drop · neon rings</option><option value="minimal">Minimal · subtle punch</option>
          </select></label>
          <label className="slider-field"><span>Beat FX strength<strong>{project.beatSync?.intensity??70}%</strong></span><input type="range" min="0" max="100" value={project.beatSync?.intensity??70} onChange={e=>changeSync({intensity:Number(e.target.value)})}/></label>
          <h3>Frequency trigger mixer</h3>
          <p className="muted detail">Choose how much each drum event moves your video, including separate bass-drop response. All values affect live preview and exports.</p>
          {(['kickGain','snareGain','hatGain','dropGain'] as const).map((key)=><label className="slider-field" key={key}><span>{key==='kickGain'?'Kick impact':key==='snareGain'?'Snare impact':key==='hatGain'?'Hi-hat impact':'Bass-drop impact'} <strong>{project.beatSync?.[key]??100}%</strong></span><input type="range" min="0" max="200" step="5" value={project.beatSync?.[key]??100} onChange={e=>changeSync({[key]:Number(e.target.value)})}/></label>)}

          <label className="field">Beat timing offset (ms)<input type="number" step="10" min="-1000" max="1000" value={Math.round((project.beatSync?.offset||0)*1000)} onChange={e=>changeSync({offset:Math.max(-1,Math.min(1,Number(e.target.value)/1000||0))})}/></label>
          <div className="beat-action-pair"><button className="btn outline" onClick={()=>shiftBeats(-.02)}>−20 ms</button><button className="btn outline" onClick={()=>shiftBeats(.02)}>+20 ms</button></div>
          <div className="panel-divider"/><h3>Tap Tempo & Manual Rhythm Grid</h3>
          <p className="muted detail">Tap along to the bass at least four times. The generated grid is editable and can replace unreliable detection.</p>
          <div className="beat-action-pair"><button className="btn outline" onClick={tapTempo}>♫ Tap BPM</button><button className="btn outline" disabled={!tappedBpm} onClick={useTappedGrid}>Generate {tappedBpm||'—'} BPM Grid</button></div>
          <button className="btn outline full" onClick={exportBeatsCSV}>↓ Export beat markers (.csv)</button>
          <div className="panel-divider"/><h3>Manual beat & drop editing</h3>
          <p className="muted detail">Position playhead on a kick or drop. Add/remove markers even when automatic analysis misses them.</p>
          <div className="beat-action-pair"><button className="btn outline" onClick={addBeatHere}>+ Beat at playhead</button><button className="btn outline" onClick={removeBeatHere}>− Nearest beat</button></div>
          <button className="btn outline full" onClick={toggleDrop}>Toggle bass-drop at beat</button>
          <div className="panel-divider"/><h3>Auto Cut Montage</h3>
          <label className="field">Shot length<select value={beatsPerCut} onChange={e=>setBeatsPerCut(Number(e.target.value) as 1|2|4|8)}>
            <option value={1}>Every kick/snare onset · fast</option><option value={2}>Every 2 beats · classic</option><option value={4}>Every 4 beats · smooth</option><option value={8}>Every 8 beats · cinematic</option>
          </select></label>
          <label className="field">Transition<select value={montageTransition} onChange={e=>setMontageTransition(e.target.value as typeof montageTransition)}><option value="zoom">Beat zoom</option><option value="fade">Fade</option><option value="slide">Slide</option><option value="none">Hard cut</option></select></label>
          <button className="btn primary full" onClick={runMontage}>⚡ Generate Beat-Synced Cuts</button>
          <p className="muted detail">Uses existing uploaded images/videos. Does not create footage. Replaces visual clip arrangement, but Undo can restore it. Up to 58 clips.</p>
          <div className="panel-divider"/><h3>Drop Caption Generator</h3>
          <label className="field">Caption<input maxLength={60} value={dropCaption} onChange={e=>setDropCaption(e.target.value)}/></label>
          <button className="btn outline full" onClick={addTitles}>+ Generate drop captions</button>
          <p className="muted detail">Avoid rapid flashes if sensitive to flicker. Export is browser/codec-dependent and should be checked before publishing.</p>
        </>}
        {panel==='director'&&<>
          <div className="panel-heading"><h2>Auto Director Pro</h2><small>Offline, editable</small></div>
          <p className="muted detail">Rhythm-aware shot planning, beat grading and keyframes. Uses your own images and video — no generated or uploaded media.</p>
          <h3>Music arrangement map</h3>
          {sections.length?<div className="arrangement-list">{sections.map((section,i)=><button key={i} className={`arrangement-card energy-${section.label}`} onClick={()=>seek(section.start)} title={`Seek to ${section.start.toFixed(2)} seconds`}><span><strong>{section.label.toUpperCase()}</strong><small>{section.start.toFixed(1)}–{section.end.toFixed(1)}s</small></span><small>{section.beats} beats · {section.drops} drops</small><i style={{width:`${Math.min(100,Math.max(6,section.energy*25))}%`}}/></button>)}</div>:<p className="empty-message">Import a track or tap a tempo to build the arrangement view.</p>}
          <div className="panel-divider"/><h3>Smart shot director</h3>
          <label className="field">Rhythm focus<select value={directorFocus} onChange={e=>setDirectorFocus(e.target.value as DirectorOptions['focus'])}><option value="all">All strong beats</option><option value="kick">Kick / bass onsets</option><option value="snare">Snare / clap</option><option value="hat">High-hat transients</option></select></label>
          <label className="slider-field"><span>Minimum onset confidence<strong>{Math.round(directorStrength*100)}%</strong></span><input type="range" min={0} max={.95} step={.05} value={directorStrength} onChange={e=>setDirectorStrength(Number(e.target.value))}/></label>
          <label className="field">Cut every<select value={beatsPerCut} onChange={e=>setBeatsPerCut(Number(e.target.value) as 1|2|4|8)}><option value={1}>1 onset</option><option value={2}>2 onsets</option><option value={4}>4 onsets</option><option value={8}>8 onsets</option></select></label>
          <label className="field">Shot motion choreography<select value={directorMotion} onChange={e=>setDirectorMotion(e.target.value as MotionPreset)}><option value="punch">Bass Punch</option><option value="drift">JDM Drift</option><option value="orbit">Orbit Camera</option><option value="glide">Smooth Glide</option><option value="none">Static cuts</option></select></label>
          <label className="field">Transition<select value={montageTransition} onChange={e=>setMontageTransition(e.target.value as typeof montageTransition)}><option value="zoom">Zoom</option><option value="fade">Fade</option><option value="slide">Slide</option><option value="none">Hard cut</option></select></label>
          <button className="btn primary full" onClick={applyDirector}>⚡ Build Directed Phonk Edit</button>
          <button className="btn outline full" onClick={applySelectedMotion}>Apply selected motion to active clip</button>
          <div className="panel-divider"/><h3>Beat quantization</h3>
          <label className="field">Subdivision<select value={quantizeDivision} onChange={e=>setQuantizeDivision(Number(e.target.value) as 1|2|4)}><option value={1}>Quarter beat</option><option value={2}>Eighth beat</option><option value={4}>Sixteenth beat</option></select></label>
          <label className="slider-field"><span>Quantize tightness<strong>{quantizeTightness}%</strong></span><input type="range" min="0" max="100" step="5" value={quantizeTightness} onChange={e=>setQuantizeTightness(Number(e.target.value))}/></label>
          <button className="btn outline full" onClick={rhythmQuantize}>Quantize beat markers</button>
          <div className="beat-action-pair"><button className="btn outline" onClick={()=>quantizeClips('selected')}>Snap selected clip</button><button className="btn outline" onClick={()=>quantizeClips('all')}>Snap visual/text clips</button></div>
          <div className="panel-divider"/><h3>Ripple move</h3>
          <p className="muted detail">Moves the chosen image, video or text clip and later visual/text clips as a group. Does not move audio or background FX.</p>
          <label className="field">Move seconds<input type="number" min="-180" max="180" step=".1" value={rippleSeconds} onChange={e=>setRippleSeconds(Number(e.target.value)||0)}/></label>
          <button className="btn outline full" onClick={shiftClips}>⇄ Ripple move forward/back</button>
          <div className="panel-divider"/><h3>Professional handoff</h3>
          <button className="btn outline full" onClick={saveEDL}>↓ Download edit decision list (.csv)</button>
          <button className="btn outline full" onClick={saveCaptions}>↓ Download text captions (.srt)</button>
          <p className="muted detail">EDL/SRT are editable companion files, not a multi-format video interchange file. Export remains browser supported formats only.</p>
        </>}
        {panel==='effects'&&<><div className="panel-heading"><h2>Visual effects</h2><small>Live controls</small></div><p className="muted detail">Changes preview immediately and are applied to export.</p><label className="field">Spectrum style<select value={project.settings.mode} onChange={e=>setSetting('mode',e.target.value as Settings['mode'])}><option value="bars">Frequency Bars</option><option value="circle">Circular Spectrum</option><option value="wave">Flowing Waveform</option><option value="particles">Reactive Particles</option><option value="mirror">Mirrored Spectrum</option><option value="spiral">Energy Spiral</option><option value="rings">Triple Neon Rings</option><option value="avee">Avee-style Orbital Reactor</option><option value="catpulse">Phonk Cat Pulse</option><option value="ncs">NCS-style Halo (original)</option><option value="aura">Ultra Aura Pulse Rings</option></select></label>
        <label className="field">Backdrop style<select value={project.settings.backdrop||'grid'} onChange={e=>setSetting('backdrop',e.target.value as Settings['backdrop'])}><option value="grid">Cyber grid</option><option value="aurora">Neon aurora</option><option value="solid">Solid background</option></select></label>{range('intensity','Bass intensity')}{range('glow','Neon glow')}{range('shake','Camera shake',40)}{range('particles','Floating particles')}{range('zoom','Camera zoom',50)}{range('vignette','Cinematic vignette')}{range('grain','Film grain')}{range('beatPulse','Bass zoom pulse')}{range('scanlines','Retro scanlines')}{range('chromatic','Neon edge fringing')}{range('letterbox','Cinematic letterbox')}<label className="field">Background color<input aria-label="Background color" type="color" value={project.settings.background} onChange={e=>setSetting('background',e.target.value)}/></label><div className="color-row"><label>Primary glow<input aria-label="Primary glow color" type="color" value={project.settings.primary} onChange={e=>setSetting('primary',e.target.value)}/></label><label>Accent glow<input aria-label="Secondary glow color" type="color" value={project.settings.secondary} onChange={e=>setSetting('secondary',e.target.value)}/></label></div><div className="panel-divider"/><h3>Color palette presets</h3><div className="color-preset-grid">{[
          ['Neon Ice','#32f5ff','#b850fb'],['Crimson','#ff3858','#853dff'],['Toxic Bass','#7dff42','#06efb7'],['Sunset','#ff9b51','#e843b7'],
          ['Moonlight','#b5c8ff','#59aaff'],['Voltage','#ffd35f','#ff5b64'],['Ocean','#10fac9','#338aff'],['Ghost','#ffffff','#7f93b8']
          ].map(([name,first,second])=><button key={name} title={`Apply ${name} color palette`} className="color-preset" onClick={()=>commit(p=>({...p,settings:{...p.settings,primary:first,secondary:second}}))}><i style={{background:`linear-gradient(135deg,${first},${second})`}}/>{name}</button>)}</div><div className="panel-divider"/><h3>Audio mixer · 3-band EQ</h3><p className="muted detail">Affects both monitoring and export when imported audio is available. Approximate bands: 180 Hz, 1.1 kHz, 4.8 kHz.</p>{(['bass','mid','treble'] as const).map(k=><label className="slider-field" key={k}><span>{k==='bass'?'Bass / low shelf':k==='mid'?'Mid frequencies':'Treble / high shelf'} <strong>{project.settings.eq?.[k]??0} dB</strong></span><input type="range" min={-18} max={18} step={1} value={project.settings.eq?.[k]??0} onChange={e=>setEQ(k,Number(e.target.value))}/></label>)}<label className="check-option"><input type="checkbox" checked={project.settings.eq?.compressor||false} onChange={e=>setEQ('compressor',e.target.checked)}/> Dynamic compressor</label><button className="btn outline full" onClick={()=>commit(p=>({...p,settings:{...p.settings,eq:{bass:0,mid:0,treble:0,compressor:false}}}))}>Reset EQ</button></>}
        {panel==='inspector'&&<><div className="panel-heading"><h2>Layer inspector</h2><small>{active?.kind||'No selection'}</small></div>{!active?<p className="empty-message">Select a layer in the timeline.</p>:<><label className="field">Layer name<input value={active.label} maxLength={70} onChange={e=>edit({label:e.target.value})}/></label><label className="field">Start time (seconds)<input type="number" min="0" max={project.duration} step="0.1" value={active.start} onChange={e=>edit({start:Number(e.target.value)})}/></label><label className="field">Duration (seconds)<input type="number" min="0.1" max={project.duration} step="0.1" value={active.duration} onChange={e=>edit({duration:Number(e.target.value)})}/></label>{active.kind==='text'&&<><label className="field">Overlay text<textarea value={active.text||''} maxLength={100} rows={3} onChange={e=>edit({text:e.target.value})}/></label><label className="field">Font<select value={active.fontFamily||'sans'} onChange={e=>edit({fontFamily:e.target.value as Track['fontFamily']})}><option value="sans">Bold Sans</option><option value="serif">Editorial Serif</option><option value="mono">Tech Monospace</option></select></label><label className="field">Font size<input type="range" min="0.02" max="0.16" step=".002" value={active.fontSize||.063} onChange={e=>edit({fontSize:Number(e.target.value)})}/></label><label className="field">Text color<input type="color" value={active.fontColor||'#ffffff'} onChange={e=>edit({fontColor:e.target.value})}/></label></>}
                {(active.kind==='image'||active.kind==='video')&&<><label className="field">Image fit<select value={active.fit||'cover'} onChange={e=>edit({fit:e.target.value as Track['fit']})}><option value="cover">Cover / crop</option><option value="contain">Contain / fit</option></select></label><label className="field">Source trim / offset (s)<input type="number" min="0" max="60000" step=".1" value={active.clipStart||0} onChange={e=>edit({clipStart:Math.max(0,Number(e.target.value))})}/></label></>}
                {(active.kind==='video'||active.kind==='image'||active.kind==='text')&&<>
                  <label className="check-option"><input type="checkbox" checked={active.flipX||false} onChange={e=>edit({flipX:e.target.checked})}/> Mirror horizontally</label>
                </>}
                {active.kind==='video'&&<label className="field">Video speed · {active.playbackRate||1}×<input type="range" min=".25" max="4" step=".25" value={active.playbackRate||1} onChange={e=>edit({playbackRate:Number(e.target.value)})}/></label>}
                <label className="field">Fade in ({active.fadeIn||0}s)<input type="range" min="0" max={Math.min(4,active.duration)} step=".1" value={Math.min(active.fadeIn||0,Math.min(4,active.duration))} onChange={e=>edit({fadeIn:Number(e.target.value)})}/></label>
                <label className="field">Fade out ({active.fadeOut||0}s)<input type="range" min="0" max={Math.min(4,active.duration)} step=".1" value={Math.min(active.fadeOut||0,Math.min(4,active.duration))} onChange={e=>edit({fadeOut:Number(e.target.value)})}/></label>
                {active.kind==='audio'&&<><label className="field">Audio volume {Math.round((active.volume??1)*100)}%<input type="range" min="0" max="2" step="0.05" value={active.volume??1} onChange={e=>edit({volume:Number(e.target.value)})}/></label><p className="muted detail">Audio segments can be split and joined. Editing is non-destructive; export renders the arrangement.</p><label className="field">Audio source In (seconds)<input type="number" min="0" max={active.sourceDuration||MAX_COMPOSITION_SECONDS} step=".1" value={active.clipStart||0} onChange={e=>edit({clipStart:Math.min(active.sourceDuration||MAX_COMPOSITION_SECONDS,Math.max(0,Number(e.target.value)))})}/></label><label className="field">Audio source Out (seconds)<input type="number" min="0" max={active.sourceDuration||MAX_COMPOSITION_SECONDS} step=".1" value={Math.round(((active.clipStart||0)+active.duration)*10)/10} onChange={e=>edit({duration:Math.min(project.duration-active.start,Math.max(.1,Number(e.target.value)-(active.clipStart||0)))})}/></label><div className="inspector-actions"><button className="btn outline" onClick={splitAtPlayhead}>✂ Split audio</button><button className="btn outline" onClick={joinAudio}>⇥ Join next</button></div></>}
                {active.kind!=='audio'&&<><div className="panel-divider"/><div className="panel-heading"><h3>Motion & Keyframes</h3><small>{active.keyframes?.length||0} points</small></div><div className="inspector-actions"><button className="btn outline" onClick={addKeyframe}>◆ Add keyframe</button><button className="btn outline" disabled={!hasKeyframe} onClick={delKeyframe}>Remove</button></div><p className="muted detail">Move the playhead, add a keyframe, then adjust sliders. Properties interpolate during playback and export.</p>
                {(['x','y','scale','rotation','opacity'] as const).map(k=><label className="slider-field" key={k}><span>{k==='x'?'Horizontal %':k==='y'?'Vertical %':k==='scale'?'Scale':k==='rotation'?'Rotation °':'Opacity'} <strong>{Math.round((activeMotion?.[k]||0)*100)/100}</strong></span><input type="range" min={k==='scale' ? 0.2 : k==='rotation' ? -180 : 0} max={k==='scale' ? 3 : k==='rotation' ? 180 : k==='opacity' ? 1 : 100} step={k==='scale'||k==='opacity' ? .01 : 1} value={activeMotion?.[k]??0} onChange={e=>editMotion(k,Number(e.target.value))}/></label>)}
                <label className="field">Entrance / exit<select value={active.transition||'none'} onChange={e=>edit({transition:e.target.value as Track['transition']})}><option value="none">No transition</option><option value="fade">Fade in/out</option><option value="slide">Slide from left</option><option value="zoom">Zoom in/out</option><option value="whip">Velocity Whip</option><option value="glitch">Glitch Cut</option><option value="spin">Spin Entry</option></select></label>
                <label className="field">Blend mode<select value={active.blend||'normal'} onChange={e=>edit({blend:e.target.value as Track['blend']})}><option value="normal">Normal</option><option value="screen">Screen</option><option value="multiply">Multiply</option><option value="overlay">Overlay</option></select></label></>}<div className="check-row"><label><input type="checkbox" checked={!active.hidden} onChange={e=>edit({hidden:!e.target.checked})}/> Visible</label>{active.kind==='audio'&&<label><input type="checkbox" checked={!active.muted} onChange={e=>edit({muted:!e.target.checked})}/> Sound on</label>}</div><div className="inspector-actions"><button className="btn outline" onClick={duplicate}>Duplicate</button><button className="btn outline danger" onClick={remove}>Delete layer</button></div></>}<div className="panel-divider"/><h3>Project settings</h3><label className="field">Duration (seconds)<input type="number" min="1" max="600" step="1" value={project.duration} onChange={e=>{const dur=Math.min(MAX_COMPOSITION_SECONDS,Math.max(1,Number(e.target.value)||1));commit(p=>resizeComposition(p,dur));}}/></label><button className="btn outline full danger" onClick={reset}>Reset project</button></>}
      </aside>
      <section className="studio-workspace" aria-label="Video editing workspace">
        <div className="mobile-quick-actions">
          <button onClick={createAuraReel}>✦ Ultra Aura 15s</button>
          <button onClick={()=>openMobilePanel('templates')}>❖ Templates</button>
          <button onClick={()=>openMobilePanel('fxlab')}>⚡ Motion FX</button>
          <button onClick={()=>openMobilePanel('assets')}>＋ Media</button>
        </div>
        <div className="preview-meta"><div><b>Composition preview</b><small>Realtime browser canvas</small></div><span className="chip-dot"><i/> {project.settings.width}p · {project.settings.fps} FPS</span></div>
        <div className="video-shell"><div className="video-stage" style={{aspectRatio:project.settings.aspect==='16:9'?'16 / 9':project.settings.aspect==='9:16'?'9 / 16':'1 / 1'}}><canvas ref={canvas} aria-label="Animated music spectrum preview" role="img"/></div></div>
        <div className="player-controls"><button className="play-btn" aria-label={playing?'Pause preview':'Play preview'} onClick={()=>void togglePlay()}>{playing?'Ⅱ':'▶'}</button><span className="timecode">{formatSeconds(position)} <em>/ {formatSeconds(project.duration)}</em></span><input className="transport-slider" aria-label="Seek timeline" type="range" min={0} max={project.duration} step="0.05" value={position} onChange={e=>seek(Number(e.target.value))}/><button className="btn tiny outline" onClick={()=>jumpToMarker(-1)} title="Previous beat">⇤ Beat</button><button className="btn tiny outline" onClick={()=>jumpToMarker(1)} title="Next beat">Beat ⇥</button><button className="btn tiny outline" onClick={()=>jumpToMarker(1,true)} title="Jump to next bass drop">⚡ Drop</button><button className="btn tiny outline" onClick={()=>seek(0)} title="Back to start">↤</button><label className="snap-control"><input aria-label="Loop preview" type="checkbox" checked={loopPreview} onChange={e=>{setLoopPreview(e.target.checked);loopRef.current=e.target.checked;}}/> Loop</label><label className="aspect-control">Ratio<select aria-label="Video aspect ratio" value={project.settings.aspect} onChange={e=>{const a=e.target.value as Settings['aspect'];commit(p=>({...p,settings:{...p.settings,aspect:a,width:a==='9:16'?720:a==='1:1'?1080:1280}}));}}><option>16:9</option><option>9:16</option><option>1:1</option></select></label></div>
        <div className="mobile-selected-tools" aria-label="Quick selected clip tools">
           <span className="mobile-selected-name">{active?active.label:'Select a clip'}</span>
           <div className="mobile-tool-actions">
             <button disabled={!active} onClick={splitAtPlayhead}>✂ Split</button>
             <button disabled={!active} onClick={()=>openMobilePanel('inspector')}>☷ Adjust</button>
             <button disabled={!active} onClick={()=>openMobilePanel('fxlab')}>✦ Effects</button>
             <button disabled={!active} onClick={duplicate}>▣ Copy</button>
             <button disabled={!active} onClick={remove}>⌫ Delete</button>
           </div>
         </div>
         <div className="timeline"><div className="timeline-top"><h2>Multitrack timeline <span className="timeline-info">{project.tracks.length} layers</span></h2><div className="timeline-actions"><button className="btn tiny outline" onClick={addText}>+ Text</button><button className="btn tiny outline" onClick={()=>{const id=`track-${crypto.randomUUID()}`;commit(p=>({...p,tracks:[...p.tracks,{id,kind:'effect',label:'New FX layer',start:0,duration:p.duration,hidden:false,muted:false}]}));setSelected(id);}}>+ FX</button><button className="btn tiny outline" disabled={!active} onClick={splitAtPlayhead} title="Split audio, text, or visual clip at playhead (S)">✂ Split</button><button className="btn tiny outline" onClick={()=>openMobilePanel('shorts')}>▯ Shorts Lab</button><button className="btn tiny outline" onClick={()=>openMobilePanel('beats')}>⚡ Beat Sync</button><button className="btn tiny outline" onClick={()=>openMobilePanel('director')}>✦ Auto Director</button><label className="snap-control"><input type="checkbox" checked={snapEnabled} onChange={e=>setSnapEnabled(e.target.checked)}/> Beat snap</label></div></div>
          <div className="timeline-ruler" aria-hidden="true"><span>00:00</span><span>{formatSeconds(project.duration*.25)}</span><span>{formatSeconds(project.duration*.5)}</span><span>{formatSeconds(project.duration*.75)}</span><span>{formatSeconds(project.duration)}</span></div>
          <div className="beat-info">{project.beatSync?<><strong>{project.beatSync.map.bpm?`≈ ${project.beatSync.map.bpm} BPM`:'Manual / unknown BPM'}</strong><span>{activeBeats.length} sync markers · {beatDrops} drop candidates · <button type="button" onClick={()=>openMobilePanel('beats')}>Edit beat map ↗</button></span></>:<span>Import audio to detect beat markers, then open the Beat Sync panel.</span>}</div>
          <div className="track-list">{project.tracks.map((t,i)=><div className={`track-row ${selected===t.id?'picked':''}`} key={t.id}><button className="track-name" onClick={()=>selectForEdit(t.id)} title={`${t.kind}: ${t.label}`}><span className="track-kind">{icon[t.kind]}</span><span>{t.label}</span></button><div className="track-lane" onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();seek((e.clientX-rect.left)/rect.width*project.duration)}}>
                    {timelineMarks.map((beat,bi)=><span key={bi} className={`beat-mark ${beat.drop?'drop-mark':''}`} title={`${beat.drop?'DROP · ':''}${beat.band} ${beat.at.toFixed(2)}s`} style={{left:`${beat.at/project.duration*100}%`}}/>)}
                    <button data-track={t.id} onPointerDown={e=>onDragStart(e,t)} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd} className={`track-segment ${t.kind} ${t.hidden?'dimmed':''}`} style={{left:`${(dragState?.id===t.id?dragState.start:t.start)/project.duration*100}%`,width:`${t.duration/project.duration*100}%`}} title={`${t.label}; drag to move; select to inspect`} onClick={e=>{e.stopPropagation();selectForEdit(t.id)}}>
                    {t.kind==='audio'&&insights?.waveform.length?<span className="waveform-bar-strip">{insights.waveform.filter((_,n)=>n%3===0).map((n,i)=><i key={i} style={{height:`${Math.max(8,Math.round(n*96))}%`}} />)}</span>:t.kind==='audio'?'∿ ∿ ∿ ∿':t.kind==='visualizer'?'▥ ▥ ▥ ▥ ▥':t.kind==='image'?'▧ Image':t.kind==='video'?'▶ Video':t.kind==='effect'?'✦ ✦ ✦':'T · '+(t.text||'Text')}
                    {t.keyframes?.map((k,i)=><span key={i} className="keyframe-mark" style={{left:`${k.at/t.duration*100}%`}} title={`Keyframe ${k.at.toFixed(2)}s`} />)}
                    </button></div><div className="track-move"><button disabled={i===0} aria-label={`Move ${t.label} up`} onClick={()=>commit(p=>moveTrack(p,t.id,-1))}>↑</button><button disabled={i===project.tracks.length-1} aria-label={`Move ${t.label} down`} onClick={()=>commit(p=>moveTrack(p,t.id,1))}>↓</button></div></div>)}</div>
          <div className="playhead-line" style={{left:`calc(168px + (100% - 224px) * ${position/project.duration})`}} aria-hidden="true" />
        </div>
        {!!warning&&<div className="studio-notice" role="status"><span>ⓘ</span> {warning}<button aria-label="Dismiss message" onClick={()=>setWarning('')}>×</button></div>}
      </section>
      <aside className={`studio-right ${mobileSheet==='export'?'mobile-export-open':''}`} aria-label="Export settings panel">
       <div className="mobile-sheet-heading"><span className="sheet-grip"/><b>Video export</b><button aria-label="Close export sheet" onClick={()=>setMobileSheet('closed')}>✕</button></div><div className="panel-heading"><h2>Export settings</h2><small>Free · on-device</small></div><div className="export-preview"><span>✦</span><b>{project.settings.aspect}</b><small>{project.settings.width} × {dimensions(project.settings.aspect,project.settings.width).height}</small></div><label className="field">Frame rate<select value={project.settings.fps} onChange={e=>setSetting('fps',Number(e.target.value) as 24|30|60)}><option value="24">24 fps</option><option value="30">30 fps</option><option value="60">60 fps (high load)</option></select></label><label className="field">Output quality<select value={project.settings.width} onChange={e=>setSetting('width',Number(e.target.value))}><option value="720">720px width</option><option value="1080">1080px width</option><option value="1280">1280px width</option></select></label><label className="field">Video bitrate<select value={project.settings.bitrate||5} onChange={e=>setSetting('bitrate',Number(e.target.value) as 2|5|8)}><option value="2">2 Mbps · small</option><option value="5">5 Mbps · balanced</option><option value="8">8 Mbps · high quality</option></select></label><label className="field">Export video format
  <select aria-label="Export video format" value={exportPreset} onChange={e=>setExportPreset(e.target.value as 'instagram'|'webm')} disabled={exporting||conversionRunning}>
    <option value="instagram">Instagram / Shorts MP4 · H.264 + AAC</option>
    <option value="webm">Original browser video · WebM (fast)</option>
  </select>
</label>
<p className="muted detail">For Instagram Reels choose MP4. Video is encoded on your device after recording; on unsupported browsers an original WebM backup is saved.</p>
<label className="btn outline full converter-button">↻ Convert existing WebM to Instagram MP4
  <input aria-label="Convert old video to Instagram MP4" type="file" hidden accept=".webm,video/webm,.mp4,video/mp4,.mov,video/quicktime" disabled={exporting||conversionRunning} onChange={e=>{void convertExistingVideo(e.target.files?.[0]);e.currentTarget.value='';}}/>
</label>
<button className="btn outline full" onClick={capturePng}>▣ Download PNG snapshot</button><div className="divider"/><div className="status-list"><span><i className="ok-dot"/> Spectrum {visual?'ready':'hidden'}</span><span><i className={audioTrack?'ok-dot':'idle-dot'}/> Audio {audioTrack?'attached':'not added'}</span><span><i className={picture?'ok-dot':'idle-dot'}/> Artwork {picture?'attached':'optional'}</span><span><i className={browserExport?'ok-dot':'idle-dot'}/> Export {browserExport?'supported':'not supported'}</span></div><button className="btn primary full export-main" onClick={()=>void doExport()} disabled={!browserExport||exporting||conversionRunning}>↓ {exporting?'Rendering video…':'Export to device'}</button>{exporting&&<><progress aria-label="Export progress" value={exportPercent} max={100} /><div className="export-progress">{exportPercent}% · {exportPreset==='instagram'?'MP4 · recording':codec.includes('mp4')?'MP4':'WebM'} <button onClick={()=>stopExport.current?.()}>Cancel</button></div></>}{conversionRunning&&<div className="export-progress" role="status">Encoding Instagram MP4 locally {conversionPercent===null?'':`${conversionPercent}%`} — do not close this tab.</div>}<p className="muted detail">Browser export runs in real time. The output codec depends on browser support. Heavy projects may be slow on mobile. Use only music and media you own or have permission to use.</p><div className="divider"/><Link href="/guides/phonk-visualizer" className="help-link">How to create a phonk visualizer ↗</Link></aside>
    </main>
    <nav className="mobile-tool-tabs" aria-label="Mobile studio tools">
        {([{p:'assets',name:'Media',glyph:'▣'},{p:'music',name:'Audio',glyph:'♫'},{p:'templates',name:'Templates',glyph:'❖'},{p:'fxlab',name:'Aura FX',glyph:'✦'},{p:'inspector',name:'Tools',glyph:'☷'}] as const).map(item=><button key={item.p} aria-current={mobileSheet==='tools'&&panel===item.p?'page':undefined} onClick={()=>mobileSheet==='tools'&&panel===item.p?setMobileSheet('closed'):openMobilePanel(item.p)}>{item.glyph}<span>{item.name}</span></button>)}
        <button aria-current={mobileSheet==='export'?'page':undefined} onClick={()=>mobileSheet==='export'?setMobileSheet('closed'):openExportSheet()}>↓<span>Export</span></button>
      </nav>
    <div className="studio-bottom"><span><i className="ok-dot"/> LOCAL-FIRST STUDIO</span><span>⌨ Space play · S split · B beat marker · ← → frame-step · Ctrl+Z undo</span><span>No subscription needed</span></div>
  </div>;
}
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60_000);}

/** Deterministic two-song phonk crossfade planner; no audio downloads or licensing assumptions. */
export type MixControls={
 aIn:number;aOut:number;bIn:number;bOut:number;
 crossfade:number;speedB:number;volumeA:number;volumeB:number;bassDb:number;
};
export type MixPlan={
 aIn:number;bIn:number;aLength:number;bLength:number;bSpeed:number;
 bAt:number;overlap:number;duration:number;volumeA:number;volumeB:number;bassDb:number;
};
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const round=(n:number)=>Math.round(n*1000)/1000;
const numeric=(n:number,fallback:number)=>Number.isFinite(n)?n:fallback;
export const DEFAULT_MIX:MixControls={aIn:0,aOut:30,bIn:0,bOut:30,crossfade:4,speedB:1,volumeA:.9,volumeB:.9,bassDb:3};

/** Browser-safe maximum for uncompressed stereo WAV export: <= 180 seconds. */
export function planPhonkMashup(durA:number,durB:number,controls:MixControls):MixPlan {
 if(!Number.isFinite(durA)||!Number.isFinite(durB)||durA<.5||durB<.5)throw Error('Import two valid audio files first.');
 const aIn=clamp(numeric(controls.aIn,0),0,Math.max(0,durA-.25));
 const bIn=clamp(numeric(controls.bIn,0),0,Math.max(0,durB-.25));
 const aOut=clamp(numeric(controls.aOut,durA),aIn+.25,durA);
 const bOut=clamp(numeric(controls.bOut,durB),bIn+.25,durB);
 const bSpeed=clamp(numeric(controls.speedB,1),.75,1.5);
 const aLength=aOut-aIn,bLength=(bOut-bIn)/bSpeed;
 const overlap=clamp(numeric(controls.crossfade,0),0,Math.min(aLength,bLength,15));
 const bAt=aLength-overlap;
 const duration=aLength+bLength-overlap;
 if(duration>180)throw Error('Mashup exceeds 180 seconds; reduce clip In/Out to protect browser memory.');
 return {
  aIn:round(aIn),bIn:round(bIn),aLength:round(aLength),bLength:round(bLength),
  bSpeed:round(bSpeed),bAt:round(bAt),overlap:round(overlap),duration:round(duration),
  volumeA:clamp(numeric(controls.volumeA,1),0,1.5),
  volumeB:clamp(numeric(controls.volumeB,1),0,1.5),
  bassDb:clamp(numeric(controls.bassDb,0),-12,12)
 };
}

export function encodePcmWav(channels:Float32Array[],sampleRate:number):Blob {
 if(!channels.length||channels.length>2||!channels[0]?.length||!Number.isFinite(sampleRate)||sampleRate<8000||sampleRate>192000)throw Error('Invalid PCM data');
 const count=channels[0].length;
 if(channels.some(ch=>ch.length!==count))throw Error('Channel lengths differ');
 const ch=channels.length,bytes=count*ch*2;
 if(bytes>100*1024*1024)throw Error('Audio render is too large');
 const out=new ArrayBuffer(44+bytes),view=new DataView(out);
 const write=(at:number,str:string)=>{for(let j=0;j<str.length;j++)view.setUint8(at+j,str.charCodeAt(j));};
 write(0,'RIFF');view.setUint32(4,36+bytes,true);write(8,'WAVE');write(12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,ch,true);
 view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*ch*2,true);
 view.setUint16(32,ch*2,true);view.setUint16(34,16,true);
 write(36,'data');view.setUint32(40,bytes,true);
 let o=44;
 for(let i=0;i<count;i++)for(let c=0;c<ch;c++){
   const v=Math.max(-1,Math.min(1,channels[c][i]||0));
   view.setInt16(o,v<0?Math.round(v*32768):Math.round(v*32767),true);o+=2;
 }
 return new Blob([out],{type:'audio/wav'});
}

export function routeMashup(
 ctx:AudioContext|OfflineAudioContext,
 a:AudioBuffer,b:AudioBuffer,plan:MixPlan
):AudioBufferSourceNode[]{
 const srcA=ctx.createBufferSource(),srcB=ctx.createBufferSource();
 srcA.buffer=a;srcB.buffer=b;srcB.playbackRate.value=plan.bSpeed;
 const gainA=ctx.createGain(),gainB=ctx.createGain();
 const bass=ctx.createBiquadFilter(),compressor=ctx.createDynamicsCompressor();
 bass.type='lowshelf';bass.frequency.value=150;bass.gain.value=plan.bassDb;
 compressor.threshold.value=-8;compressor.ratio.value=2.5;
 srcA.connect(gainA);srcB.connect(gainB);
 gainA.connect(bass);gainB.connect(bass);bass.connect(compressor);compressor.connect(ctx.destination);
 gainA.gain.setValueAtTime(plan.volumeA,0);
 gainB.gain.setValueAtTime(plan.overlap?0:plan.volumeB,plan.bAt);
 if(plan.overlap>0){
   const end=plan.bAt+plan.overlap;
   gainA.gain.setValueAtTime(plan.volumeA,plan.bAt);
   gainA.gain.linearRampToValueAtTime(0,end);
   gainB.gain.linearRampToValueAtTime(plan.volumeB,end);
 }
 srcA.start(0,plan.aIn,plan.aLength);
 srcB.start(plan.bAt,plan.bIn,plan.bLength*plan.bSpeed);
 return [srcA,srcB];
}

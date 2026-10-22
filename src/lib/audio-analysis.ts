/** Lightweight, deterministic PCM waveform + onset estimates; no network or AI services. */
export type AudioInsights={waveform:number[]; beats:number[]; bpm:number|null; duration:number; peak:number};
export function analyzePCM(samples:Float32Array,sampleRate:number):AudioInsights {
  if(samples.length===0||!Number.isFinite(sampleRate)||sampleRate<1000)return {waveform:[],beats:[],bpm:null,duration:0,peak:0};
  const duration=samples.length/sampleRate;
  const bins=160,window=Math.max(256,Math.floor(sampleRate*.025));
  const waveform:number[]=[],energy:number[]=[];
  let peak=0;
  for(let i=0;i<bins;i++){
    const start=Math.floor(i*samples.length/bins),end=Math.min(samples.length,Math.floor((i+1)*samples.length/bins));
    let sum=0,max=0;for(let j=start;j<end;j+=Math.max(1,Math.floor((end-start)/350))){const v=Math.abs(samples[j]||0);max=Math.max(max,v);sum+=v;}
    waveform.push(max);peak=Math.max(peak,max);
  }
  const stride=Math.max(1,Math.floor(sampleRate*.010));
  for(let base=0;base<samples.length;base+=stride){let power=0,count=0;for(let j=base;j<Math.min(samples.length,base+window);j+=Math.max(1,Math.floor(window/128))){const v=samples[j];power+=v*v;count++;}energy.push(Math.sqrt(power/Math.max(1,count)));}
  const deltas=energy.map((e,i)=>i?Math.max(0,e-energy[i-1]):0);
  const sorted=[...deltas].sort((a,b)=>a-b);
  const threshold=sorted[Math.floor(sorted.length*.86)]||0;
  const beats:number[]=[];
  for(let i=2;i<deltas.length-2;i++){
    if(deltas[i]>=Math.max(.015,threshold*1.5)&&deltas[i]>deltas[i-1]&&deltas[i]>=deltas[i+1]){
      const time=i*stride/sampleRate;
      if(!beats.length||time-beats[beats.length-1]>.17)beats.push(time);
    }
  }
  // Interval histogram, octave-folded into 70–180 BPM. Confidence gating prevents fake results on silence.
  let bpm:number|null=null;
  if(beats.length>=6){const counts=new Map<number,number>();
    for(let i=1;i<beats.length;i++){let dt=beats[i]-beats[i-1];if(dt<.18||dt>2)continue;
      while(dt<60/180)dt*=2;while(dt>60/70)dt/=2;
      const key=Math.round((60/dt)/2)*2;counts.set(key,(counts.get(key)||0)+1);
    }
    const winner=[...counts].sort((a,b)=>b[1]-a[1])[0];if(winner&&winner[1]>=3)bpm=winner[0];
  }
  return {waveform,beats:beats.slice(0,1200),bpm,duration,peak};
}

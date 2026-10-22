import type {Settings,StudioProject,Transition} from './types.ts';
export type FxPreset={
 id:string;title:string;description:string;transition:Transition;
 values:Partial<Pick<Settings,'glow'|'shake'|'beatPulse'|'scanlines'|'chromatic'|'zoom'|'grain'|'vignette'|'particles'|'letterbox'|'intensity'|'mode'|'primary'|'secondary'>>;
};
export const PHONK_FX_PRESETS:readonly FxPreset[]=[
 {id:'velocity',title:'Velocity Whip',description:'Fast motion swipe and short bass impacts',transition:'whip',values:{shake:18,zoom:12,beatPulse:32,chromatic:35,glow:65}},
 {id:'ghost',title:'Ghost Glitch',description:'Digital jump cut with drifting channel edges',transition:'glitch',values:{chromatic:75,grain:28,scanlines:33,glow:80}},
 {id:'orbit',title:'Neon Spin',description:'Rotating overlay with radiant orbital waveform',transition:'spin',values:{mode:'avee',glow:88,particles:48,zoom:14}},
 {id:'jdm',title:'Night Drift',description:'Cyan/purple night-driving transition',transition:'slide',values:{primary:'#24e8ff',secondary:'#bb52ff',shake:22,grain:18,zoom:12,scanlines:12}},
 {id:'cobra',title:'Hard Phonk Punch',description:'Aggressive red bass-reactive circular kicks',transition:'zoom',values:{mode:'catpulse',primary:'#ff2955',secondary:'#a54eff',beatPulse:50,shake:28,glow:90}},
 {id:'ncs',title:'Prism Halo',description:'Minimal NCS-inspired audio-reactive spectrum',transition:'fade',values:{mode:'ncs',glow:75,shake:2,particles:22,grain:0}},
 {id:'tape',title:'VHS Afterdark',description:'Controlled analog lines and muted impact',transition:'glitch',values:{scanlines:74,grain:65,chromatic:24,vignette:64,glow:38}},
 {id:'noir',title:'Dark Reverb',description:'Soft cinematic atmosphere without strong flashes',transition:'fade',values:{glow:35,shake:0,zoom:3,beatPulse:9,letterbox:38,vignette:80}},
 {id:'tunnel',title:'Laser Tunnel',description:'Spiralling neon energy and quick sync pulse',transition:'whip',values:{mode:'spiral',primary:'#37ffbc',secondary:'#4680ff',zoom:18,glow:92}},
 {id:'neon',title:'Aurora Shift',description:'Blue-magenta cinematic smooth motion',transition:'slide',values:{mode:'rings',primary:'#38e5ff',secondary:'#fb52d6',shake:5,glow:85}}
];
export function applyPhonkFx(project:StudioProject,id:string,scope:'selected'|'all',selectedId?:string):StudioProject {
 const preset=PHONK_FX_PRESETS.find(x=>x.id===id);
 if(!preset)return project;
 const apply=(t:StudioProject['tracks'][number])=>(
    ['image','video','text'].includes(t.kind)&&(scope==='all'||t.id===selectedId)?
    {...t,transition:preset.transition}:t
 );
 const selectedEligible=project.tracks.some(t=>t.id===selectedId&&['image','video','text'].includes(t.kind));
 if(scope==='selected'&&!selectedEligible)return project;
 return {...project,updatedAt:Date.now(),settings:{...project.settings,...preset.values},tracks:project.tracks.map(apply)};
}

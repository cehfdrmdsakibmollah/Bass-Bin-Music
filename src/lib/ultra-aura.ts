import type {StudioProject,Settings} from './types.ts';
import {templates,applyTemplate} from './templates.ts';
export type AuraPreset={slug:string;title:string;description:string;category:'Soft'|'Hard'|'Drift'|'Dark'; colors:[string,string];mode:Settings['mode'];intensity:number;glow:number;shake:number;beatPulse:number;zoom:number;grain:number;chromatic:number;vignette:number;scanlines:number;particles:number};
export const AURA_PRESETS:readonly AuraPreset[]=[
 {slug:'ultra-aura',title:'Ultra Aura',description:'Blue-violet aura with luminous bass-reactive rings',category:'Hard',colors:['#57e5ff','#a56cff'],mode:'aura',intensity:92,glow:92,shake:15,beatPulse:39,zoom:15,grain:8,chromatic:25,vignette:48,scanlines:6,particles:42},
 {slug:'ultra-aura-soft',title:'Aura Float',description:'Soft cyan-violet shimmer and slow cinematic drift',category:'Soft',colors:['#7be9ff','#a78bfa'],mode:'aura',intensity:67,glow:74,shake:5,beatPulse:17,zoom:7,grain:5,chromatic:12,vignette:28,scanlines:0,particles:36},
 {slug:'ultra-aura-hard',title:'Hard Bass Aura',description:'High-energy magenta and dark-blue kick pulse',category:'Hard',colors:['#f455fe','#3968ff'],mode:'aura',intensity:100,glow:98,shake:27,beatPulse:52,zoom:19,grain:14,chromatic:31,vignette:61,scanlines:15,particles:57},
 {slug:'night-drive-aura',title:'Night Drive Aura',description:'Low-key electric-blue mist and smooth motion',category:'Drift',colors:['#1ad3fe','#6756ff'],mode:'aura',intensity:83,glow:81,shake:11,beatPulse:29,zoom:13,grain:15,chromatic:18,vignette:62,scanlines:12,particles:49},
 {slug:'ghost-aura',title:'Ghost Wave Aura',description:'Teal ghost rings and dark atmospheric contrast',category:'Dark',colors:['#50ffe1','#637afa'],mode:'aura',intensity:88,glow:89,shake:10,beatPulse:36,zoom:12,grain:19,chromatic:26,vignette:70,scanlines:23,particles:40}
];
export function auraSettings(settings:Settings,slug:string):Settings {
 const preset=AURA_PRESETS.find(x=>x.slug===slug);
 if(!preset)return settings;
 return {...settings,primary:preset.colors[0],secondary:preset.colors[1],mode:preset.mode,intensity:preset.intensity,glow:preset.glow,shake:preset.shake,beatPulse:preset.beatPulse,zoom:preset.zoom,grain:preset.grain,chromatic:preset.chromatic,vignette:preset.vignette,scanlines:preset.scanlines,particles:preset.particles,backdrop:'aurora'};
}
/** Explicit 2-step template apply. The preview never mutates the saved project. */
export function previewTemplateSettings(p:StudioProject,slug:string):Settings {
 const template=templates.find(t=>t.slug===slug);
 if(template)return {...p.settings,primary:template.colors[0],secondary:template.colors[1],mode:template.mode,intensity:template.energy};
 return auraSettings(p.settings,slug);
}
export function commitTemplateChoice(p:StudioProject,slug:string):StudioProject {
 const regular=templates.find(t=>t.slug===slug);
 if(regular)return applyTemplate(p,slug);
 const aura=AURA_PRESETS.find(t=>t.slug===slug);
 if(!aura)return p;
 return {...p,template:slug,updatedAt:Date.now(),settings:auraSettings(p.settings,slug)};
}

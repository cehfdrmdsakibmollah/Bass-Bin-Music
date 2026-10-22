import type { StudioProject, Settings } from './types';
export type Template = { slug: string; name: string; category: string; description: string; colors: [string, string]; mode: Settings['mode']; energy: number; tags: string[] };
export const templates: Template[] = [
  {slug:'signature-skull',name:'Dark Skull Bass',category:'Signature Phonk',description:'Custom dark skull, crimson bass-reactive spikes and industrial atmosphere. Creator artwork optional.',colors:['#fe3e68','#9958fb'],mode:'phonk-skull',energy:93,tags:['signature','skull','memphis','hard']},
  {slug:'signature-drift',name:'Midnight Drift',category:'Signature Phonk',description:'Wet midnight roadway, tail lights and off-center neon spectrum. Add your own drift footage.',colors:['#ff4c78','#5598fa'],mode:'phonk-drift',energy:82,tags:['signature','car','jdm','drift']},
  {slug:'signature-tape',name:'Memphis Tape',category:'Signature Phonk',description:'Original cassette deck, moving reels and wide real-audio waveform.',colors:['#e15748','#efb16c'],mode:'phonk-tape',energy:86,tags:['signature','memphis','cassette','tape']},

  { slug:'dark-drift', name:'Dark Drift Phonk', category:'Drift', description:'Low-key street energy with red neon and heavyweight bass bars.', colors:['#ff315c','#af48ff'], mode:'bars', energy:85, tags:['cars','drift','dark'] },
  { slug:'brazilian-phonk', name:'Brazilian Phonk', category:'Phonk', description:'High-energy cyan and green motion for Brazilian phonk edits.', colors:['#00f4d1','#a6ff47'], mode:'circle', energy:95, tags:['brazilian','funk','bass'] },
  { slug:'jdm-night-drive', name:'JDM Night Drive', category:'Automotive', description:'Midnight blue highways, magenta waveform and Tokyo-inspired night visuals.', colors:['#36e8ff','#e448ff'], mode:'wave', energy:76, tags:['jdm','night','car'] },
  { slug:'neon-city', name:'Neon City', category:'Neon', description:'Electric cyan spectra and purple city-night glows.', colors:['#10f1ff','#9c57ff'], mode:'bars', energy:80, tags:['city','glow','phonk'] },
  { slug:'anime-vibes', name:'Anime Vibes', category:'Anime', description:'Soft neon sound waves with editable image overlays for licensed artwork.', colors:['#ff6bce','#65c6ff'], mode:'wave', energy:60, tags:['anime','lofi','wave'] },
  { slug:'horror-cinematic', name:'Horror Cinematic', category:'Dark', description:'Atmospheric low-frequency particles, dark crimson and eerie motion.', colors:['#e82546','#8124bf'], mode:'particles', energy:68, tags:['horror','cinematic'] },
  { slug:'skull-visualizer', name:'Skull Visualizer', category:'Dark', description:'Heavy circular reactive spectrum with an intense violet-red palette.', colors:['#ee497a','#8351ff'], mode:'circle', energy:92, tags:['skull','heavy'] },
  { slug:'retro-wave', name:'Retro Wave', category:'Retro', description:'Synthwave-inspired horizon, pink and blue nighttime sound waves.', colors:['#fa4cc7','#47c5ff'], mode:'wave', energy:62, tags:['retro','synthwave'] },
  { slug:'bass-boost', name:'Bass Boost', category:'Bass', description:'Punchy high-contrast equalizer bars for beat-heavy releases.', colors:['#ff4667','#00e7ff'], mode:'bars', energy:100, tags:['bass','boost'] },
  { slug:'minimal-spectrum', name:'Minimal Music Spectrum', category:'Clean', description:'Simple restrained circle spectrum for polished music releases.', colors:['#e9edff','#62cafa'], mode:'circle', energy:38, tags:['minimal','spectrum'] },
  { slug:'cyber-spiral', name:'Cyber Spiral', category:'Futuristic', description:'Swirling ultraviolet energy that follows each bass pulse.', colors:['#52f3ff','#8e47ff'], mode:'spiral', energy:82, tags:['spiral','edm','neon'] },
  { slug:'midnight-mirror', name:'Midnight Mirror', category:'Drift', description:'Reflected frequency bars across a moody horizon.', colors:['#ff4677','#3fdcff'], mode:'mirror', energy:89, tags:['mirror','car','dark'] },
  { slug:'laser-tunnel', name:'Laser Tunnel', category:'Cinematic', description:'Emerald laser motion with a spiral high-energy spectrum.', colors:['#43ffb4','#02a6ff'], mode:'spiral', energy:87, tags:['laser','tunnel','techno'] },
  { slug:'trance-rings', name:'Trance Rings', category:'EDM', description:'Triple concentric neon spectrum with crystal blue accents.', colors:['#af73ff','#40eaff'], mode:'rings', energy:76, tags:['rings','trance','edm'] },
  { slug:'rainy-drift', name:'Rainy Drift', category:'Chill', description:'Low-light violet reflections for atmospheric night-driving edits.', colors:['#839dff','#f159d7'], mode:'mirror', energy:58, tags:['night','drift','rain'] },
  {slug:'avee-bass-reactor',name:'Avee Inspired Bass Reactor',category:'Avee Inspired',description:'Original editable elliptical radial spectrum that reacts to heavy phonk kicks.',colors:['#38f8ff','#fa49e5'],mode:'avee',energy:90,tags:['avee','neon','orbital']},
  {slug:'avee-darkwave',name:'Midnight Cat Pulse',category:'Avee Inspired',description:'Neon cat-ear contours above a bass-driven orbital ring. Original geometry.',colors:['#a95cff','#00d9ff'],mode:'catpulse',energy:96,tags:['avee','cat','phonk']},
  {slug:'ncs-prism',name:'NCS Inspired Prism Halo',category:'NCS Inspired',description:'Minimal bright ring with independent pulse, no NCS branding or logos.',colors:['#46d5ff','#ffffff'],mode:'ncs',energy:68,tags:['ncs-style','halo','spectrum']},
  {slug:'ncs-night-ring',name:'Aurora Night Halo',category:'NCS Inspired',description:'Landscape-ready symmetric music halo and restrained blue ambience.',colors:['#22fca1','#277dff'],mode:'ncs',energy:72,tags:['ncs-style','night','halo']},
  {slug:'phonk-cobrawave',name:'Cobra Phonk Glitch',category:'Phonk',description:'Saturated scarlet neon ring and aggressive cross frequency edges.',colors:['#ff334d','#a34eff'],mode:'avee',energy:99,tags:['hard','phonk','glitch']},
  {slug:'phonk-purple-shift',name:'Purple Drift Spectrum',category:'Drift',description:'Purple underground neon visualizer for original drifting footage.',colors:['#ae54ff','#31baff'],mode:'catpulse',energy:85,tags:['drift','phonk','purple']},
  { slug:'digital-voltage', name:'Digital Voltage', category:'Bass', description:'Electric neon orange energy spirals for punchy drops.', colors:['#ff9354','#ff3dc8'], mode:'spiral', energy:99, tags:['voltage','bass','drop'] }
];
export const defaultSettings: Settings = {
  aspect:'16:9', fps:30, width:1280, mode:'phonk-skull', primary:'#fe3e68', secondary:'#9958fb',
  intensity:88, glow:42, shake:9, particles:10, zoom:4, title:'BASS BIN MUSIC', background:'#050409',
  backdrop:'solid',vignette:32,grain:8,beatPulse:22,bitrate:5,eq:{bass:0,mid:0,treble:0,compressor:false}
};
export function createProject(seed = Date.now()): StudioProject {
  return {
    schemaVersion:1, id:`bbm-${seed}`, name:'Untitled Phonk Project', template:'signature-skull', createdAt:seed,updatedAt:seed,duration:20,
    settings:{...defaultSettings}, tracks:[
      {id:'visualizer',kind:'visualizer',label:'Audio Spectrum',start:0,duration:20,hidden:false,muted:false},
      {id:'title',kind:'text',label:'Editable artist title',start:0,duration:20,hidden:false,muted:false,text:'BASS BIN MUSIC',fontSize:.055,fontColor:'#e3dfe8',fontFamily:'mono',motion:{x:50,y:88,scale:1,rotation:0,opacity:1},transition:'fade'},
      {id:'fx',kind:'effect',label:'Glow effects',start:0,duration:20,hidden:false,muted:false}
    ]
  };
}
export function applyTemplate(project:StudioProject,slug:string):StudioProject {
  const template=templates.find(t=>t.slug===slug);
  if(!template) return project;
  const signature=template.category==='Signature Phonk';
  const tracks=signature?project.tracks.map(t=>t.kind==='text'&&t.id==='title'?{...t,label:'Editable artist title',text:slug==='signature-skull'?'BASS BIN MUSIC':slug==='signature-drift'?'NIGHT DRIVE':'MEMPHIS TAPE',fontSize:.055,fontColor:'#e3dfe8',fontFamily:'mono' as const,motion:{x:50,y:88,scale:1,rotation:0,opacity:1}}:t):project.tracks;
  return {...project,template:slug,updatedAt:Date.now(),tracks,settings:{...project.settings,primary:template.colors[0],secondary:template.colors[1],mode:template.mode,intensity:template.energy,...(signature?{background:'#050409',backdrop:'solid' as const,glow:47,shake:9,beatPulse:28,grain:12,particles:12,vignette:30}:{})}};
}

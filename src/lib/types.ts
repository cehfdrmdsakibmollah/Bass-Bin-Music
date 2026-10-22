import type {BeatSync} from './beat-sync.ts';
export type TrackKind = 'audio' | 'image' | 'video' | 'text' | 'visualizer' | 'effect';
export type Aspect = '16:9' | '9:16' | '1:1';
export type VisualMode = 'bars' | 'circle' | 'wave' | 'particles' | 'mirror' | 'spiral' | 'rings';
export type Motion = { x:number; y:number; scale:number; rotation:number; opacity:number };
export type MotionKeyframe = Partial<Motion> & {at:number};
export type Transition = 'none' | 'fade' | 'slide' | 'zoom';
export type Track = {
  id:string; kind:TrackKind; label:string; start:number; duration:number;
  hidden:boolean; muted:boolean; assetId?:string; text?:string;
  clipStart?:number; sourceDuration?:number; volume?:number; motion?:Partial<Motion>;
  keyframes?:MotionKeyframe[]; transition?:Transition;
  fontSize?:number; fontFamily?:'sans'|'serif'|'mono'; fontColor?:string;
  fit?:'cover'|'contain'; blend?:'normal'|'screen'|'multiply'|'overlay';
  playbackRate?:number; fadeIn?:number; fadeOut?:number; flipX?:boolean;
};
export type Equalizer = {bass:number; mid:number; treble:number; compressor:boolean};
export type Settings = {
  aspect:Aspect; fps:24|30|60; width:number; mode:VisualMode;
  primary:string; secondary:string; intensity:number; glow:number;
  shake:number; particles:number; zoom:number; title:string;
  background:string; backdrop?:'grid'|'aurora'|'solid';
  vignette?:number; grain?:number; beatPulse?:number; bitrate?:2|5|8;
  eq?:Equalizer; scanlines?:number; chromatic?:number; letterbox?:number;
};
// Optional v0.2 properties deliberately preserve compatibility with v0.1 local projects.
export type StudioProject = {
  schemaVersion:1; id:string; name:string; template:string;
  createdAt:number; updatedAt:number; duration:number;
  settings:Settings; tracks:Track[]; beatSync?:BeatSync;
};
export type AssetEntry = {id:string; kind:'audio'|'image'|'video'; name:string; file:Blob};

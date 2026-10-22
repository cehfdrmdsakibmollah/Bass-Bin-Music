export function formatSeconds(seconds:number){const s=Math.max(0,Math.floor(seconds));return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;}
export function dimensions(aspect:'16:9'|'9:16'|'1:1',width:number){return {width,height:Math.round(width/(aspect==='16:9'?16/9:aspect==='9:16'?9/16:1))};}
export function getExportMime():string|null{
  if(typeof MediaRecorder==='undefined')return null;
  return ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t))??null;
}
export function checkFile(file:File,kind:'audio'|'image'|'video'){
  const accepted={audio:['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/ogg','audio/mp4','audio/aac'],image:['image/jpeg','image/png','image/webp'],video:['video/mp4','video/webm','video/quicktime']}[kind];
  const limit={audio:100, image:20,video:250}[kind]*1024*1024;
  if(file.size>limit)throw Error(`File is too large. Max ${Math.round(limit/1048576)} MB.`);
  if(!accepted.includes(file.type))throw Error(`Unsupported file type (${file.type||'unknown'}).`);
}

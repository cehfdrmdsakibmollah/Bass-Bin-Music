/**
 * Instagram-friendly conversion: browser-local WebM/other -> H.264 + AAC MP4.
 * Does not upload a customer's audio or video to a server.
 * Conversion requires browser WebCodecs support; errors are surfaced to the caller.
 */
export async function convertToInstagramMp4(
  source:Blob,
  onProgress?:(progress:number)=>void
):Promise<Blob>{
  if(typeof window==='undefined')throw new Error('MP4 conversion is only available in a browser.');
  if(source.size<1000)throw new Error('The input video is empty or incomplete.');
  if(source.size>250*1024*1024)throw new Error('Video is over 250 MB. Convert on your computer instead.');
  const {
    Input, ALL_FORMATS, BlobSource, Output, BufferTarget, Mp4OutputFormat,
    Conversion, Quality, canEncodeAudio
  }=await import('mediabunny');
  if(!(await canEncodeAudio('aac'))){
    const {registerAacEncoder}=await import('@mediabunny/aac-encoder');
    registerAacEncoder();
  }
  const input=new Input({source:new BlobSource(source),formats:ALL_FORMATS});
  const videoTrack=await input.getPrimaryVideoTrack();
  if(!videoTrack)throw new Error('No usable video track was found in the file.');
  const output=new Output({format:new Mp4OutputFormat(),target:new BufferTarget()});
  const conversion=await Conversion.init({
    input,output,tracks:'primary',
    video:{
      codec:'avc',
      frameRate:30,
      quality:new Quality('high'),
      forceTranscode:true,
      keyFrameInterval:2
    },
    audio:{codec:'aac',sampleRate:48000,forceTranscode:true}
  });
  if(!conversion.isValid){
    const reasons=conversion.discardedTracks.map(t=>String(t.reason||'unsupported codec')).join('; ');
    throw new Error('This browser cannot encode the MP4: '+(reasons||'unsupported H.264/AAC encoder'));
  }
  conversion.onProgress=p=>onProgress?.(Math.round(p*100));
  await conversion.execute();
  const buffer=output.target.buffer;
  if(!buffer||buffer.byteLength<1024)throw new Error('MP4 encoder returned an empty file.');
  return new Blob([buffer],{type:'video/mp4'});
}

import type {Settings,Track} from './types';
import {evaluateMotion,trackTransition} from './advanced.ts';
import {beatEnvelope,type BeatSync} from './beat-sync.ts';
import {drawPhonkBackdrop,drawPhonkHero,isSignatureMode} from './phonk-scenes.ts';
export type MediaCanvasAsset=HTMLImageElement|HTMLVideoElement;
const active=(track:Track,time:number)=>!track.hidden&&time>=track.start&&time<track.start+track.duration;
const rand=(seed:number)=>{const v=Math.sin(seed*127.1+78.233)*43758.5453123;return v-Math.floor(v);};
function fitMedia(ctx:CanvasRenderingContext2D,media:MediaCanvasAsset,w:number,h:number,fit:'contain'|'cover'='cover'){
  const isImage=media instanceof HTMLImageElement;
  const mw=isImage?media.naturalWidth:media.videoWidth,mh=isImage?media.naturalHeight:media.videoHeight;
  if(!mw||!mh)return;
  const scale=fit==='contain'?Math.min(w/mw,h/mh):Math.max(w/mw,h/mh);
  ctx.drawImage(media,(w-mw*scale)/2,(h-mh*scale)/2,mw*scale,mh*scale);
}
function composite(mode:Track['blend']):GlobalCompositeOperation {
  return mode==='screen'||mode==='multiply'||mode==='overlay'?mode:'source-over';
}
function drawLayer(ctx:CanvasRenderingContext2D,t:Track,time:number,w:number,h:number,min:number,media:Map<string,MediaCanvasAsset>,settings:Settings){
  const motion=evaluateMotion(t,time),tr=trackTransition(t,time);
  const local=time-t.start,left=t.duration-local;
  const fadeIn=t.fadeIn?Math.min(1,Math.max(0,local/t.fadeIn)):1;
  const fadeOut=t.fadeOut?Math.min(1,Math.max(0,left/t.fadeOut)):1;
  ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,motion.opacity*tr.opacity*Math.min(fadeIn,fadeOut)));
  ctx.globalCompositeOperation=composite(t.blend);
  ctx.translate(w*(motion.x/100+tr.dx),h*motion.y/100);
  ctx.rotate((motion.rotation+(tr.rotation||0))*Math.PI/180);
  ctx.scale(motion.scale*tr.scale*(t.flipX?-1:1),motion.scale*tr.scale);
  if((t.kind==='image'||t.kind==='video')&&t.assetId){
    const item=media.get(t.assetId);
    if(item){ctx.translate(-w/2,-h/2);fitMedia(ctx,item,w,h,t.fit||'cover');ctx.fillStyle='rgba(4,6,17,.20)';ctx.fillRect(0,0,w,h);}
  }
  if(t.kind==='text'){
    const fontFamily=t.fontFamily==='serif'?'Georgia,serif':t.fontFamily==='mono'?'monospace':'Arial,sans-serif';
    ctx.font=`900 ${Math.round(min*(t.fontSize??.063))}px ${fontFamily}`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowBlur=min*.035;ctx.shadowColor=settings.secondary;
    ctx.fillStyle=t.fontColor||'#ffffff';
    const txt=(t.text||settings.title).slice(0,100);
    // Multi-line centered captions with safe maximum width.
    txt.split('\n').slice(0,4).forEach((line,i,parts)=>ctx.fillText(line,0,(i-(parts.length-1)/2)*min*(t.fontSize??.063)*1.27,w*.87));
  }
  ctx.restore();
}
export function drawFrame(ctx:CanvasRenderingContext2D,settings:Settings,tracks:Track[],audioData:Uint8Array,time:number,media:Map<string,MediaCanvasAsset>,beatSync?:BeatSync){
  const {width:w,height:h}=ctx.canvas,min=Math.min(w,h);
  const {pulse:beatPulse,drop:beatDrop,band:beatBand}=beatEnvelope(beatSync,time);
  const beatMode=beatSync?.style||'drift';
  const spectrum=tracks.some(t=>t.kind==='visualizer'&&active(t,time));
  const effects=tracks.some(t=>t.kind==='effect'&&active(t,time));
  let bass=0;const bassBins=Math.min(25,audioData.length);
  for(let i=0;i<bassBins;i++)bass+=audioData[i];
  const level=bassBins?bass/(bassBins*255):0;
  // Motion fallback is only for silent/no-audio projects, not an invented music beat.
  const energy=audioData.some(v=>v>0)?level:.09;
  const wobble=(effects?energy*settings.shake/100*min*.07:0)+beatPulse*min*(beatMode==='hard'?.021:beatMode==='drift'?.012:beatMode==='cinematic'?.005:.001);
  ctx.save();ctx.fillStyle=settings.background;ctx.fillRect(0,0,w,h);
  ctx.translate(Math.sin(time*13)*wobble,Math.cos(time*17)*wobble);
  const pulse=1+(effects?settings.zoom/1300*(1+energy):0)+energy*(settings.beatPulse||0)/2500+beatPulse*(beatMode==='hard'?.105:beatMode==='drift'?.068:beatMode==='cinematic'?.045:.022);
  ctx.translate(w/2,h/2);ctx.scale(pulse,pulse);ctx.translate(-w/2,-h/2);
  if(settings.backdrop!=='solid'){
    const grad=ctx.createRadialGradient(w*.5,h*.47,0,w*.5,h*.48,Math.max(w,h)*.68);
    grad.addColorStop(0,'#142342');grad.addColorStop(.52,'#0b1024');grad.addColorStop(1,settings.background);
    ctx.fillStyle=grad;ctx.fillRect(-20,-20,w+40,h+40);
  }
  if(settings.backdrop!=='solid'){
    for(const [px,py,rad,col] of [[.28,.57,.58,settings.secondary],[.76,.38,.5,settings.primary]] as const){
      const grad=ctx.createRadialGradient(w*px,h*py,0,w*px,h*py,w*rad);
      grad.addColorStop(0,col+'43');grad.addColorStop(1,'transparent');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    }
    if(settings.backdrop==='grid'||settings.backdrop===undefined){
      ctx.strokeStyle='rgba(102,154,211,.10)';ctx.lineWidth=Math.max(1,min/720);
      const grid=Math.max(20,Math.round(min/14));
      for(let x=0;x<w;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
      for(let y=0;y<h;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    }
  }
  if(isSignatureMode(settings.mode))drawPhonkBackdrop(ctx,settings.mode,w,h,time,settings.primary,settings.secondary);
  for(const t of tracks)if((t.kind==='image'||t.kind==='video')&&active(t,time))drawLayer(ctx,t,time,w,h,min,media,settings);
  if(effects){
    for(let i=0;i<Math.round(settings.particles*1.4);i++){
      const x=rand(i*9.7)*w,y=((rand(i*3.3)*h+time*(7+rand(i*5)*21))%h);
      ctx.globalAlpha=.12+rand(i+9)*.38;ctx.fillStyle=i%3?settings.primary:settings.secondary;
      ctx.beginPath();ctx.arc(x,y,min*(.00075+rand(i+7)*.0023),0,Math.PI*2);ctx.fill();
    }ctx.globalAlpha=1;
  }
  if(spectrum){
    const count=64,strength=settings.intensity/100;
    const amp=(i:number)=>Math.max(.04,audioData.length?audioData[Math.floor(i%count/count*audioData.length)]/255:.10)*(.5+strength*.85);
    ctx.save();ctx.shadowColor=settings.primary;ctx.shadowBlur=effects?settings.glow/100*min*.05:0;
    switch(settings.mode){
      case 'phonk-skull':case 'phonk-drift':case 'phonk-tape':{
        const artTrack=tracks.slice().reverse().find(t=>(t.kind==='image'||t.kind==='video')&&active(t,time)&&t.assetId&&media.has(t.assetId));
        const art=artTrack?.assetId?media.get(artTrack.assetId)||null:null;
        drawPhonkHero(ctx,settings.mode,settings,audioData,time,beatPulse,beatDrop,art);
        break;
      }
      case 'bars':case 'mirror':{
        const span=w*.69,x0=(w-span)/2,bar=span/count*.68,base=settings.mode==='bars'?h*.70:h*.51;
        for(let i=0;i<count;i++){
          const height=h*.29*amp(i)*(.7+energy*.8),x=x0+i*span/count;
          const gradient=ctx.createLinearGradient(x,base-height,x,base+height);
          gradient.addColorStop(0,settings.primary);gradient.addColorStop(1,settings.secondary);
          ctx.fillStyle=gradient;ctx.fillRect(x,base-height,bar,height+3);
          ctx.globalAlpha=settings.mode==='mirror'?.83:.20;ctx.fillRect(x,base+5,bar,settings.mode==='mirror'?height:height*.32);ctx.globalAlpha=1;
        }break;
      }
      case 'circle':case 'rings':{
        const cx=w*.5,cy=h*.50,r=min*.18;
        for(let j=0;j<(settings.mode==='rings'?3:1);j++){
          for(let i=0;i<count*2;i++){
            const a=i/(count*2)*Math.PI*2,radius=r+j*min*.095,hh=min*.15*amp(i%count)*(1+energy*.4);
            ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);
            ctx.lineTo(cx+Math.cos(a)*(radius+hh),cy+Math.sin(a)*(radius+hh));
            ctx.lineWidth=Math.max(1.5,min*.004);ctx.strokeStyle=(i+j)%2?settings.primary:settings.secondary;ctx.stroke();
          }
        }
        if(settings.mode==='circle'){ctx.beginPath();ctx.arc(cx,cy,r*.89,0,Math.PI*2);ctx.lineWidth=min*.004;ctx.strokeStyle=settings.secondary;ctx.stroke();}
        break;
      }
      case 'avee':case 'ncs':case 'catpulse':{
        // All three original geometry renderers react to actual analyser bins.
        // No third-party logo or protected Avee preset geometry is embedded.
        const cx=w*.5,cy=h*.49,ring=min*(settings.mode==='ncs'?.225:.19);
        const total=160,levels=Array.from({length:total},(_,i)=>amp(Math.floor(i/total*count)));
        const isCat=settings.mode==='catpulse';
        const isNcs=settings.mode==='ncs';
        ctx.lineJoin='round';
        for(let layer=0;layer<(isNcs?2:3);layer++){
          ctx.beginPath();
          for(let i=0;i<=total;i++){
            const angle=i/total*Math.PI*2-Math.PI/2,delta=levels[i%total];
            const teeth=isNcs?min*.105:isCat?min*.19:min*.17;
            const radius=ring+Math.max(.03,delta)*teeth*(layer===0?1:layer===1?.40:.13);
            const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius;
            if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
          }
          ctx.closePath();ctx.lineWidth=min*(layer===0?.006:.0027);
          ctx.strokeStyle=layer===1?settings.secondary:settings.primary;
          ctx.globalAlpha=layer===0?1:layer===1?.62:.28;ctx.stroke();ctx.globalAlpha=1;
        }
        if(isCat){
          // Cat-ear geometry, responsive to kick intensity, without using existing logos.
          ctx.beginPath();const ear=ring*.76,top=cy-ring*.77,earTop=top-ring*(.48+energy*.18);
          ctx.moveTo(cx-ring*.93,cy-ring*.24);
          ctx.lineTo(cx-ear,earTop);
          ctx.lineTo(cx-ring*.22,top);
          ctx.moveTo(cx+ring*.22,top);
          ctx.lineTo(cx+ear,earTop);
          ctx.lineTo(cx+ring*.93,cy-ring*.24);
          ctx.strokeStyle=settings.secondary;ctx.lineWidth=min*.009;ctx.stroke();
        }
        ctx.beginPath();ctx.arc(cx,cy,ring*.78,0,Math.PI*2);
        ctx.fillStyle='rgba(3,5,16,.62)';ctx.fill();
        ctx.lineWidth=Math.max(2,min*.003);ctx.strokeStyle=settings.secondary;ctx.stroke();
        if(isNcs){
          const span=ring*.44;
          ctx.fillStyle=settings.primary;ctx.globalAlpha=.8;
          for(let i=0;i<21;i++){
            const v=levels[i*7%total];
            const x=cx-span+(span*2)*(i/20);
            const barHeight=min*.12*v;
            ctx.fillRect(x,cy-barHeight/2,Math.max(2,min*.003),barHeight);
          }
          ctx.globalAlpha=1;
        } else {
          ctx.save();ctx.fillStyle=settings.secondary;ctx.globalAlpha=.12+.16*energy;
          ctx.beginPath();ctx.arc(cx,cy,ring*.51,0,Math.PI*2);ctx.fill();ctx.restore();
        }
        break;
      }
      case 'aura':{
        // Original concentric aura spectrum; same timestamps render identically in preview and export.
        const cx=w*.5,cy=h*.49;
        const bassReact=Math.min(1,energy+beatPulse*.6);
        for(let j=5;j>=0;j--){
          const radius=min*(.145+j*.066)*(1+bassReact*.12);
          ctx.save();ctx.globalAlpha=.13+(5-j)*.085;
          ctx.beginPath();
          for(let i=0;i<=160;i++){
            const a=i/160*Math.PI*2;
            const spectral=amp(Math.floor(i/160*count));
            const r=radius+min*.04*spectral*Math.sin(a*3+time*.55+j*.64)+Math.sin(a*7+time*.8+j)*min*.012;
            const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
            if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);
          }
          ctx.closePath();ctx.lineWidth=Math.max(1.5,min*(.003+j*.0005));
          ctx.strokeStyle=j%2?settings.secondary:settings.primary;
          ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=min*.025;ctx.stroke();ctx.restore();
        }
        ctx.save();
        ctx.beginPath();ctx.arc(cx,cy,min*(.11+bassReact*.01),0,Math.PI*2);
        ctx.fillStyle='rgba(3,6,22,.86)';ctx.fill();
        ctx.lineWidth=Math.max(2,min*.006);
        ctx.strokeStyle=settings.primary;ctx.shadowColor=settings.secondary;ctx.shadowBlur=min*.025;ctx.stroke();
        ctx.restore();
        break;
      }
      case 'wave':{
        for(let j=0;j<3;j++){
          ctx.beginPath();ctx.lineWidth=Math.max(3,min*.004);ctx.strokeStyle=j===1?settings.secondary:settings.primary;
          for(let i=0;i<=200;i++){
            const x=i/200*w,s=amp(Math.floor(i/200*(count-1))),y=h*.56+Math.sin(i*.095+time*2.8+j)*s*min*.23*(1-j*.21);
            if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
          }ctx.stroke();
        }break;
      }
      case 'spiral':{
        ctx.beginPath();ctx.lineWidth=Math.max(2,min*.005);ctx.strokeStyle=settings.primary;
        for(let i=0;i<360;i++){
          const theta=i*.085+time*.35,radius=min*(.03+i/360*.40)*(1+amp(i%count)*.36);
          const x=w*.5+Math.cos(theta)*radius,y=h*.50+Math.sin(theta)*radius;
          if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }ctx.stroke();break;
      }
      default:{
        for(let i=0;i<190;i++){
          const a=rand(i*4.22)*Math.PI*2+time*.07,r=min*(.05+rand(i*13)*.38)*(1+energy*.35);
          const x=w*.5+Math.cos(a)*r,y=h*.49+Math.sin(a)*r*.7;
          const size=min*(.001+rand(i*2.2)*.004)*(1+energy*3);
          ctx.fillStyle=i%2?settings.secondary:settings.primary;ctx.fillRect(x,y,size,size);
        }
      }
    }ctx.restore();
  }
  for(const t of tracks)if(t.kind==='text'&&active(t,time))drawLayer(ctx,t,time,w,h,min,media,settings);
  // Deterministic audio-onset FX: the same timestamp produces the same frame
  // in preview, thumbnail snapshots and MediaRecorder export.
  if(beatPulse>.01){
    ctx.save();
    if(beatMode==='hard'||beatMode==='drift'){
      const y=h*(.24+.52*((Math.floor(time*17)%5)/5));
      ctx.fillStyle=beatBand==='kick'?settings.primary:settings.secondary;
      ctx.globalAlpha=Math.min(.16,beatPulse*.14);
      ctx.fillRect(0,y,w,Math.max(2,min*.016*beatPulse));
      ctx.fillRect(0,y+min*.04,w,Math.max(1,min*.004));
    }
    if(beatMode==='cinematic'||beatDrop>.15){
      ctx.beginPath();ctx.arc(w/2,h/2,min*(.16+(1-Math.min(1,beatPulse))*.55),0,2*Math.PI);
      ctx.strokeStyle=beatBand==='kick'?settings.primary:settings.secondary;
      ctx.globalAlpha=Math.min(.33,beatPulse*.30);ctx.lineWidth=Math.max(1,min*.013*beatPulse);ctx.stroke();
    }
    // Avoid violent strobe flashes. The peak is capped at 16% opacity.
    if(beatMode!=='minimal'){
      ctx.globalAlpha=Math.min(.16,beatPulse*(beatDrop>.1?.16:.055));
      ctx.fillStyle=beatBand==='snare'?settings.secondary:'#ffffff';ctx.fillRect(0,0,w,h);
    }
    ctx.restore();
  }
  const vignette=(settings.vignette??42)/100;
  if(vignette>0){
    const v=ctx.createRadialGradient(w*.5,h*.5,min*.20,w*.5,h*.5,Math.max(w,h)*.75);
    v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${vignette*.85})`);
    ctx.fillStyle=v;ctx.fillRect(0,0,w,h);
  }
  // Low-intensity analog texture. These overlays are deterministic and shared by export.
  const scanlines=(settings.scanlines||0)/100;
  if(scanlines>0){
    ctx.save();ctx.fillStyle=`rgba(0,0,0,${Math.min(.32,scanlines*.23)})`;
    const row=Math.max(4,Math.round(min/155));
    for(let y=0;y<h;y+=row*2)ctx.fillRect(0,y,w,row);
    ctx.restore();
  }
  const chroma=(settings.chromatic||0)/100;
  if(chroma>0){
    ctx.save();ctx.globalAlpha=chroma*.12;
    const edge=Math.max(2,Math.round(min*.018*chroma));
    ctx.fillStyle=settings.primary;ctx.fillRect(0,0,edge,h);
    ctx.fillStyle=settings.secondary;ctx.fillRect(w-edge,0,edge,h);
    ctx.strokeStyle=settings.secondary;ctx.lineWidth=edge/2;
    ctx.strokeRect(edge,edge,w-edge*2,h-edge*2);
    ctx.restore();
  }
  const letterbox=(settings.letterbox||0)/100;
  if(letterbox>0){ctx.save();ctx.fillStyle='#000000';const size=h*.14*letterbox;ctx.fillRect(0,0,w,size);ctx.fillRect(0,h-size,w,size);ctx.restore();}
  // Deterministic, low-density grain rather than storing a large animated texture.
  if((settings.grain||0)>0){
    const n=Math.round((settings.grain||0)*5);
    ctx.fillStyle='rgba(255,255,255,.16)';
    for(let i=0;i<n;i++)ctx.fillRect(rand(i+Math.floor(time*10)*17)*w,rand(i*3+Math.floor(time*10)*23)*h,1.2,1.2);
  }
  if(!isSignatureMode(settings.mode)){
    ctx.font=`bold ${Math.max(10,Math.round(min*.019))}px Arial,sans-serif`;
    ctx.textAlign='center';ctx.fillStyle='rgba(240,248,255,.52)';
    ctx.fillText('BASS BIN MUSIC  •  CREATE YOUR FREQUENCY',w/2,h*.93,w*.88);
  }
  ctx.restore();
}

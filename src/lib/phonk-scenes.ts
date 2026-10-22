/** BASS BIN signature Phonk looks: three truly distinct, original Canvas scenes.
 * No borrowed logo/artwork. Audio FFT and detected kicks drive shape; silent sources remain quiet.
 * Artwork supplied by the user is used as the centerpiece in Skull mode or as footage/backdrop.
 */
import type {Settings,Track} from './types.ts';
import type {MediaCanvasAsset} from './render.ts';
export const signatureModes=['phonk-skull','phonk-drift','phonk-tape'] as const;
export type SignatureMode=typeof signatureModes[number];
export const isSignatureMode=(mode:string):mode is SignatureMode=>signatureModes.some(x=>x===mode);
const tau=Math.PI*2;
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
function fft(audio:Uint8Array,index:number,count=96){
 if(!audio.length)return 0;
 const fraction=clamp(index/count);
 // Low frequencies get higher sampling resolution without hard-coded fake peaks.
 const bin=Math.min(audio.length-1,Math.floor(Math.pow(fraction,1.7)*Math.min(220,audio.length-1)));
 return audio[bin]/255;
}
const seeded=(n:number)=>{const v=Math.sin(n*12.9898+78.23)*43758.5453;return v-Math.floor(v);};
function gradient(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,alpha=.15){
 const g=ctx.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore();
}
function pathLine(ctx:CanvasRenderingContext2D,coords:number[][]){
 ctx.beginPath();coords.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
}
/** Drawn beneath any uploaded image/video. No stock image or logo required. */
export function drawPhonkBackdrop(ctx:CanvasRenderingContext2D,mode:SignatureMode,w:number,h:number,time:number,colorA:string,colorB:string){
 const min=Math.min(w,h);
 ctx.save();
 if(mode==='phonk-skull'){
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#06040d');g.addColorStop(.53,'#130713');g.addColorStop(1,'#010205');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  gradient(ctx,w*.22,h*.27,min*.64,colorB,.11);gradient(ctx,w*.83,h*.63,min*.55,colorA,.14);
  for(let i=0;i<70;i++){
   const x=seeded(i*7)*w,y=seeded(i*13)*h,size=min*(.0006+seeded(i*17)*.002);
   ctx.globalAlpha=.06+seeded(i*19)*.20;ctx.fillStyle=i%3?colorA:colorB;ctx.fillRect(x,y,size,size);
  }
  ctx.globalAlpha=1;
  for(let i=0;i<12;i++){const y=h*(.10+i*.075);ctx.strokeStyle='rgba(225,220,240,.035)';ctx.lineWidth=min*.003;pathLine(ctx,[[0,y],[w,y]]);}
 }else if(mode==='phonk-drift'){
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#020617');g.addColorStop(.55,'#071321');g.addColorStop(1,'#010308');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  gradient(ctx,w*.64,h*.26,min*.78,colorB,.18);gradient(ctx,w*.22,h*.46,min*.8,colorA,.11);
  const horizon=h*.61,vanishX=w*.49;
  // Perspective skyline with deterministic windows and wet road reflections.
  for(let i=0;i<32;i++){
   const width=w*(.009+seeded(i*3)*.037),x=i*w/31-width*.5;
   const buildH=h*(.04+seeded(i*37)*.12);
   ctx.fillStyle=i%3?'#050b14':'#091325';ctx.fillRect(x,horizon-buildH,width,buildH);
   for(let j=0;j<5;j++){
    const winY=horizon-buildH+j*buildH/6;
    ctx.globalAlpha=.16+seeded(i*11+j)*.37;
    ctx.fillStyle=j%2?colorA:colorB;ctx.fillRect(x+width*.3,winY,Math.max(1,width*.10),Math.max(1,buildH*.035));
   }
  }ctx.globalAlpha=1;
  ctx.beginPath();ctx.moveTo(vanishX,horizon);ctx.lineTo(w*1.02,h);ctx.lineTo(-w*.02,h);ctx.closePath();
  const road=ctx.createLinearGradient(0,horizon,0,h);road.addColorStop(0,'#0a111b');road.addColorStop(1,'#030608');ctx.fillStyle=road;ctx.fill();
  for(let i=0;i<14;i++){
   const t=(i+.5)/14,p=t*t,y=horizon+(h-horizon)*p,width=Math.max(1,min*.0015+min*.014*p);
   ctx.globalAlpha=.15+.36*p;ctx.fillStyle=i%2?colorA:colorB;
   ctx.fillRect(vanishX-width*.4,y,width*.8,h*.022*(p+.02));
  }ctx.globalAlpha=1;
  ctx.strokeStyle=colorB;ctx.lineWidth=Math.max(1,min*.003);ctx.globalAlpha=.34;
  pathLine(ctx,[[vanishX,horizon],[w*.84,h]]);pathLine(ctx,[[vanishX,horizon],[w*.13,h]]);
  ctx.globalAlpha=1;
  // A pair of tail lights and their reflections give the road a focal silhouette.
  const carY=h*.78,carW=w*.27;
  ctx.fillStyle='#020306';ctx.beginPath();ctx.ellipse(w*.5,carY,carW*.53,Math.max(3,h*.035),0,0,tau);ctx.fill();
  for(const side of [-1,1]){
   const x=w*.5+side*carW*.40;
   ctx.fillStyle=colorA;ctx.globalAlpha=.75;ctx.fillRect(x-carW*.08,carY-h*.007,carW*.16,Math.max(2,h*.007));
   gradient(ctx,x,carY,carW*.48,colorA,.20);
  }ctx.globalAlpha=1;
  for(let i=0;i<26;i++){
   const x=seeded(i*29)*w,y=h*.58+seeded(i*53)*h*.42;
   ctx.strokeStyle=i%4?colorB:colorA;ctx.globalAlpha=.05+.10*seeded(i*32);ctx.lineWidth=1;
   pathLine(ctx,[[x,y],[x-w*.038,y+h*.026]]);
  }ctx.globalAlpha=1;
 }else{
  // Memphis cassette: asymmetrical dark studio wall + red signal trace.
  const g=ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'#12090b');g.addColorStop(.49,'#080508');g.addColorStop(1,'#010203');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  gradient(ctx,w*.15,h*.23,min*.7,colorA,.10);
  gradient(ctx,w*.83,h*.69,min*.73,colorB,.10);
  for(let i=0;i<28;i++){
   const x=i*w/28;ctx.strokeStyle='rgba(200,160,160,.04)';ctx.lineWidth=1;pathLine(ctx,[[x,0],[x,h]]);
  }
  for(let i=0;i<14;i++){
   const y=i*h/13;ctx.strokeStyle=i%3===0?colorB:'rgba(200,110,110,.16)';
   ctx.globalAlpha=i%3===0?.18:.08;ctx.lineWidth=1.5;
   pathLine(ctx,[[0,y],[w,y]]);
  }ctx.globalAlpha=1;
 }
 ctx.restore();
}
function circleArt(ctx:CanvasRenderingContext2D,art:MediaCanvasAsset|null,cx:number,cy:number,r:number){
 if(!art)return false;
 const isImg=art instanceof HTMLImageElement;
 const iw=isImg?art.naturalWidth:art.videoWidth,ih=isImg?art.naturalHeight:art.videoHeight;
 if(!iw||!ih)return false;
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,tau);ctx.clip();
 const scale=Math.max(r*2/iw,r*2/ih),width=iw*scale,height=ih*scale;
 ctx.drawImage(art,cx-width/2,cy-height/2,width,height);
 ctx.fillStyle='rgba(5,5,14,.23)';ctx.fillRect(cx-r,cy-r,r*2,r*2);
 ctx.restore();return true;
}
function skull(ctx:CanvasRenderingContext2D,cx:number,cy:number,r:number,primary:string,energy:number){
 ctx.save();ctx.translate(cx,cy);ctx.scale(r,r);
 const g=ctx.createLinearGradient(-.6,-.9,.5,1);
 g.addColorStop(0,'#293242');g.addColorStop(.48,'#9198a4');g.addColorStop(.84,'#2a2a39');g.addColorStop(1,'#08080d');
 ctx.fillStyle=g;
 ctx.shadowColor=primary;ctx.shadowBlur=.16+energy*.16;
 ctx.beginPath();ctx.moveTo(-.62,.16);
 ctx.bezierCurveTo(-.89,-.09,-.78,-.76,-.38,-.91);ctx.bezierCurveTo(-.02,-1.08,.61,-.95,.77,-.51);
 ctx.bezierCurveTo(.9,-.1,.66,.22,.48,.30);
 ctx.lineTo(.44,.70);ctx.quadraticCurveTo(0,.99,-.43,.69);ctx.lineTo(-.48,.29);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#030407';ctx.beginPath();ctx.ellipse(-.33,-.20,.29,.24,-.18,0,tau);ctx.ellipse(.33,-.20,.29,.24,.18,0,tau);ctx.fill();
 ctx.fillStyle=primary;ctx.globalAlpha=.55+energy*.35;
 ctx.beginPath();ctx.ellipse(-.34,-.19,.115,.06,-.2,0,tau);ctx.ellipse(.34,-.19,.115,.06,.2,0,tau);ctx.fill();ctx.globalAlpha=1;
 ctx.fillStyle='#0b0b11';ctx.beginPath();ctx.moveTo(0,-.10);ctx.lineTo(-.135,.33);ctx.lineTo(.13,.33);ctx.closePath();ctx.fill();
 ctx.fillStyle='#090b10';ctx.fillRect(-.44,.49,.88,.17);
 ctx.strokeStyle='#9da1ae';ctx.lineWidth=.024;
 for(let i=0;i<7;i++){const x=-.39+i*.13;pathLine(ctx,[[x,.49],[x+.01,.68]]);}
 ctx.strokeStyle='rgba(230,230,255,.26)';ctx.lineWidth=.035;
 ctx.beginPath();ctx.moveTo(-.66,.06);ctx.quadraticCurveTo(0,.25,.66,.06);ctx.stroke();
 ctx.restore();
}
function ring(ctx:CanvasRenderingContext2D,cx:number,cy:number,r:number,fftData:Uint8Array,settings:Settings,bass:number,drop:number,style:'hard'|'smooth'){
 const min=Math.min(ctx.canvas.width,ctx.canvas.height);
 const bars=style==='hard'?120:168;
 const maxTravel=min*(style==='hard'?.105:.075);
 ctx.save();
 ctx.lineCap='round';
 for(let j=0;j<2;j++){
  ctx.beginPath();
  for(let i=0;i<=bars;i++){
   const angle=(i/bars)*tau-Math.PI/2;
   const energy=fft(fftData,(i%bars)/bars*96,96);
   const lift=Math.pow(energy,.77)*maxTravel*(j?0.24:1)+(bass+drop*.35)*min*.008;
   const rr=r+lift+j*min*.014;
   if(i===0)ctx.moveTo(cx+Math.cos(angle)*rr,cy+Math.sin(angle)*rr);
   else ctx.lineTo(cx+Math.cos(angle)*rr,cy+Math.sin(angle)*rr);
  }
  ctx.closePath();ctx.strokeStyle=j?settings.secondary:settings.primary;
  ctx.lineWidth=Math.max(1.7,min*(j?.002:.004));
  ctx.globalAlpha=j?.54:1;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=j?min*.008:min*.020;ctx.stroke();
 }ctx.globalAlpha=1;ctx.shadowBlur=0;
 // Separate mechanical ticks respond to audio; no constant circular scribbles.
 for(let i=0;i<bars;i++){
  const angle=i/bars*tau-Math.PI/2;
  const v=fft(fftData,i/bars*96,96);
  const size=min*.012+v*maxTravel*.85;
  if(v<.055&&i%3)continue;
  ctx.beginPath();ctx.moveTo(cx+Math.cos(angle)*(r+min*.014),cy+Math.sin(angle)*(r+min*.014));
  ctx.lineTo(cx+Math.cos(angle)*(r+min*.014+size),cy+Math.sin(angle)*(r+min*.014+size));
  ctx.lineWidth=Math.max(1,min*.0018);ctx.globalAlpha=.25+v*.72;
  ctx.strokeStyle=i%3?settings.primary:settings.secondary;ctx.stroke();
 }ctx.restore();
}
function textSmall(ctx:CanvasRenderingContext2D,label:string,x:number,y:number,min:number,color:string,align:CanvasTextAlign='center'){
 ctx.save();ctx.font=`700 ${Math.max(10,Math.round(min*.021))}px ui-monospace,monospace`;ctx.textBaseline='middle';ctx.textAlign=align;
 ctx.fillStyle=color;ctx.globalAlpha=.8;ctx.fillText(label,x,y,min*.82);ctx.restore();
}
/** The three layouts are intentionally not just recolored rings. */
export function drawPhonkHero(ctx:CanvasRenderingContext2D,mode:SignatureMode,settings:Settings,audio:Uint8Array,time:number,beatPulse:number,beatDrop:number,art:MediaCanvasAsset|null){
 const w=ctx.canvas.width,h=ctx.canvas.height,min=Math.min(w,h),portrait=h>w;
 const kick=clamp(fft(audio,6,96)*.55+beatPulse*.55+beatDrop*.38);
 const {primary:a,secondary:b}=settings;
 ctx.save();
 if(mode==='phonk-skull'){
   const x=w*.5,y=h*(portrait?.43:.48),r=min*(portrait?.215:.245);
   gradient(ctx,x,y,r*3.0,a,.085+kick*.05);
   if(!circleArt(ctx,art,x,y,r*.87))skull(ctx,x,y,r*.88,a,kick);
   ring(ctx,x,y,r*1.02,audio,settings,kick,beatDrop,'hard');
   ctx.strokeStyle=a;ctx.globalAlpha=.45;ctx.lineWidth=Math.max(1,min*.002);
   pathLine(ctx,[[w*.08,y],[x-r*1.55,y]]);pathLine(ctx,[[x+r*1.55,y],[w*.92,y]]);
   textSmall(ctx,'M E M P H I S   /   P H O N K',w*.5,h*(portrait?.76:.85),min,'#d1d9e5');
 }else if(mode==='phonk-drift'){
   // Off-center signal in widescreen, lifted above the car in 9:16.
   const x=portrait?w*.5:w*.74,y=portrait?h*.35:h*.39,r=min*(portrait?.20:.185);
   ctx.beginPath();ctx.arc(x,y,r*.88,0,tau);ctx.fillStyle='rgba(2,7,20,.70)';ctx.fill();
   ring(ctx,x,y,r,audio,settings,kick,beatDrop,'smooth');
   textSmall(ctx,'N I G H T   D R I V E',portrait?w*.5:w*.22,h*(portrait?.73:.40),min,'#d8dfea');
   // Kick-reactive headlight streams add motion without flashing the entire frame.
   const speed=kick*.04+beatDrop*.08;
   ctx.save();ctx.globalAlpha=.17+speed;
   ctx.strokeStyle=a;ctx.lineWidth=Math.max(1,min*.002);
   for(let i=0;i<14;i++){
    const x0=seeded(i*27)*w;
    const y0=h*.63+seeded(i*15)*h*.36;
    pathLine(ctx,[[x0,y0],[x0+(x0-w*.49)*.17,y0+h*.044]]);
   }ctx.restore();
 }else{
   const x=w*.50,y=h*(portrait?.43:.49),cw=w*(portrait?.78:.47),ch=min*.31;
   ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(time*.18)*.012);
   const g=ctx.createLinearGradient(-cw/2,-ch/2,cw/2,ch/2);
   g.addColorStop(0,'#383038');g.addColorStop(.45,'#181116');g.addColorStop(1,'#080608');
   ctx.fillStyle=g;ctx.fillRect(-cw/2,-ch/2,cw,ch);
   ctx.strokeStyle='#a39494';ctx.lineWidth=Math.max(2,min*.005);ctx.strokeRect(-cw/2,-ch/2,cw,ch);
   const labelY=-ch*.35;
   ctx.fillStyle='#c9c0aa';ctx.fillRect(-cw*.43,labelY,cw*.86,ch*.28);
   ctx.fillStyle='#251a21';ctx.font=`900 ${Math.max(10,min*.033)}px Arial`;ctx.textAlign='center';
   ctx.fillText('BASS BIN / SIDE A',0,labelY+ch*.18,cw*.8);
   for(const sign of [-1,1]){
    const reelX=sign*cw*.215,reelY=ch*.17,reelR=ch*.21;
    ctx.beginPath();ctx.arc(reelX,reelY,reelR,0,tau);ctx.fillStyle='#040406';ctx.fill();
    ctx.strokeStyle=a;ctx.lineWidth=min*.004;ctx.stroke();
    for(let i=0;i<6;i++){
     const theta=i*tau/6+time*(.45+kick*.3);
     ctx.beginPath();ctx.moveTo(reelX,reelY);ctx.lineTo(reelX+reelR*.77*Math.cos(theta),reelY+reelR*.77*Math.sin(theta));
     ctx.strokeStyle='#98949b';ctx.lineWidth=min*.004;ctx.stroke();
    }
   }
   ctx.restore();
   // Balanced stereo-style waveform: horizontal, not an NCS circle.
   const baseY=y+ch*.80,step=w*.7/96;
   for(let i=0;i<96;i++){
    const level=fft(audio,i,96),xx=w*.15+i*step;
    const hh=min*(.014+level*.19)*(1+kick*.24);
    ctx.fillStyle=i%4===0?b:a;ctx.globalAlpha=.34+level*.58;
    ctx.fillRect(xx,baseY-hh/2,Math.max(2,step*.56),hh);
   }ctx.globalAlpha=1;
   textSmall(ctx,'M E M P H I S   T A P E   /   B A S S   B I N',w*.5,h*(portrait?.76:.85),min,'#e6ccc2');
 }
 ctx.restore();
}

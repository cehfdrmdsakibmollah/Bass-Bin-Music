import type {Metadata} from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
export const metadata:Metadata={
  title:'Beat-Synced Auto Director for Phonk Video Edits',
  description:'Use kick, snare and drop markers to cut and animate your own video and photos. Learn quantization, drift motion, keyframe effects, SRT captions and local export.',
  alternates:{canonical:'/guides/auto-director-phonk-editor'}
};
export default function AutoDirectorGuide(){return <><SiteHeader/><main className="page-main container guide">
  <div className="kicker">PRO CREATOR GUIDE · LOCAL MUSIC EDITING</div>
  <h1>Give every bass hit a <span className="neon-text">video movement.</span></h1>
  <p className="page-lead">Auto Director Pro turns estimated music onsets into an editable montage of your own video and images. It is a rules-based, offline assistant, not a generative-AI model or a guarantee of perfect music analysis.</p>
  <ol className="guide-steps">
    <li><h2>Analyze your music</h2><p>Import authorized MP3, WAV or another browser-compatible audio file in Studio. Supported tracks up to 35 MB are analyzed locally. Review BPM, kicks, snares and drop events in Beat Sync. Tap BPM or adjust markers when the estimate is wrong.</p></li>
    <li><h2>Mix rhythm responses</h2><p>Separate kick, snare, hat and bass-drop impact sliders let you emphasize low-end hits or make hi-hat reactions less prominent. All reactions use the same timestamp-dependent drawing engine in preview and browser export.</p></li>
    <li><h2>Add your own footage</h2><p>Import images or video. Open Auto Director Pro, choose focus (all hits, kick, snare or hi-hat), minimum onset strength, cut interval and transition.</p></li>
    <li><h2>Pick a camera movement recipe</h2><p>Bass Punch, JDM Drift, Orbit and Smooth Glide produce editable motion keyframes in each new cut. The original files are not changed. Undo recovers the previous clip arrangement.</p></li>
    <li><h2>Fine-tune your beat grid</h2><p>Quantize timing to quarter, eighth or sixteenth subdivisions. Apply from 0% to 100% quantization strength. You can also snap a selected clip to an existing onset or ripple-move adjacent clips without moving the source audio.</p></li>
    <li><h2>Style and deliver</h2><p>Add fades, video speed adjustments, horizontal mirroring, scanlines, neon fringing, or letterbox borders. Export a subtitle SRT file or a clip-list CSV separately. The video export format is determined by browser support; inspect exported footage and audio before publishing.</p></li>
  </ol><div className="cta-inline"><h2>Make your next JDM/Phonk edit</h2><p>Your projects and imported assets stay on your device unless you explicitly publish them.</p><Link href="/studio" className="btn primary big">Launch Auto Director Pro ↗</Link></div>
</main><SiteFooter/></>}

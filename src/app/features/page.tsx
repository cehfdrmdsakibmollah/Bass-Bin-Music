import type {Metadata} from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
export const metadata:Metadata={title:'Free Audio Visualizer & Phonk Editor Features',description:'Explore BASS BIN MUSIC features: reactive sound bars, circular spectra, waveforms, particles, multi-track editing and local WebM or supported MP4 video export.',alternates:{canonical:'/features'}};
export default function Features(){return <><SiteHeader/><main className="page-main container"><div className="kicker">FREE-FIRST AUDIO VIDEO TOOLS</div><h1>Make the sound <span className="neon-text">your signature.</span></h1><p className="page-lead">An accessible browser studio for phonk creators and producers. The core editing workflow needs no subscription.</p><div className="feature-grid feature-page-grid">{[
['◉','Live Audio Analysis','Your uploaded track drives a real-time spectrum through the Web Audio API. Tweak intensity while listening.'],
['▥','Seven Spectrum Modes','Build neon bars, circular spectra, waves, particles, mirror bars, energy spirals and triple rings with editable colors.'],
['⚡','Beat-Synced Auto-Cut','Estimate kick, snare, BPM and drop points locally; sync cinematic camera effects and generate clip cuts on chosen music beats.'],
['✦','Auto Director Pro','Generate motion-keyframed Phonk cuts focused on the strongest kicks or snares. Adjust per-band response and export companion subtitles or edit lists.'],
['⌁','Cinematic Clip Controls','Add video speed changes, shot fades, clip mirroring, neon fringing, film scanlines, letterbox framing and beat quantization.'],
['▤','Layered Timeline','Add audio, picture, video, text, effects and spectrum layers. Adjust start time, duration, reorder, hide or duplicate.'],
['⌁','Mobile-friendly Workflow','Responsive controls, tap-friendly layouts and 9:16, 1:1 and 16:9 aspect ratios for your edits.'],
['⇩','Local Video Export','Record the rendered canvas and authorized audio stream to a browser-supported video format. Browser memory and codecs differ.'],
['▣','Private Browser Storage','Project settings and uploaded media live in IndexedDB on your device. Project JSON can be exported as a metadata backup.']].map(([symbol,title,desc])=><article className="feature-card" key={title}><span className="feature-symbol">{symbol}</span><h2>{title}</h2><p>{desc}</p></article>)}</div><div className="cta-inline"><h2>Try BASS BIN MUSIC Studio</h2><p><Link className="subtle-link" href="/guides/beat-sync-phonk-video">How to auto-edit Phonk video to music beats ↗</Link></p><p><Link className="subtle-link" href="/guides/auto-director-phonk-editor">Learn the Auto Director Pro workflow ↗</Link></p><p>Bring your own audio and start customizing instantly.</p><Link href="/studio" className="btn primary big">Open creator studio ↗</Link></div></main><SiteFooter/></>}

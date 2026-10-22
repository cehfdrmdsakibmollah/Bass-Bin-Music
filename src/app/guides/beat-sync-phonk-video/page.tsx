import type {Metadata} from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
export const metadata:Metadata={
  title:'How to Sync Phonk Video Cuts to Music Beats',
  description:'Learn to detect bass kicks and drops, automatically split footage on Phonk beats, apply neon zoom and shake, correct BPM and export your video.',
  alternates:{canonical:'/guides/beat-sync-phonk-video'}
};
export default function BeatSyncGuide(){return <><SiteHeader/><main className="page-main container guide">
  <div className="kicker">CREATOR GUIDE · BEAT-SYNC VIDEO EDITING</div>
  <h1>Cut your video <span className="neon-text">on the beat.</span></h1>
  <p className="page-lead">A hands-on guide to bass-synced Phonk edits with the local-first BASS BIN MUSIC Studio. No subscription or cloud upload is required for beat analysis.</p>
  <ol className="guide-steps">
    <li><h2>Import authorized music</h2><p>Open Studio, select Assets and import an MP3/WAV/OGG that your browser can decode. For supported audio up to 35 MB, local PCM analysis estimates kicks, snare/hi-hat attacks, BPM and potential drop events. These markers are estimates—check by listening.</p></li>
    <li><h2>Review and correct beat timing</h2><p>Select Beat Sync from the editor toolbar. Switch between Hard Phonk, Drift Shake, Cinematic Drop and Minimal styles. Use the timing offset and 20 ms nudge controls if the visual rhythm seems late. You can add/delete a beat at the playhead or mark it as a drop.</p></li>
    <li><h2>Try Tap BPM for unusual tracks</h2><p>If the estimate seems wrong, use Tap BPM four or more times. Generate a manual grid to replace the detected beat map. This provides rhythmic timing, not an assertion about the music’s true tempo.</p></li>
    <li><h2>Upload images or videos and generate auto cuts</h2><p>Import one or more images or authorized video files, then choose a cut every 1, 2, 4 or 8 detected beat markers. Select hard cut, fade, slide or zoom, then click Generate Beat-Synced Cuts. This replaces the current visual arrangement but does not alter the uploaded source files; Undo restores the previous timeline. Short video sources may not be long enough for every generated cut.</p></li>
    <li><h2>Highlight the bass drop</h2><p>Use Toggle Bass-Drop near a selected beat and Generate Drop Captions. Adjust caption content, position, color, motion and timing with the inspector. The same timestamp-driven FX renderer is called by preview and video export.</p></li>
    <li><h2>Choose format and verify your export</h2><p>Select 9:16 for vertical Phonk shorts, 16:9 for YouTube videos or 1:1 for square posts. Export where supported by the browser, then watch the file and verify synchronization before sharing. This implementation does not guarantee frame-perfect real-time MediaRecorder results.</p></li>
  </ol>
  <div className="cta-inline"><h2>Build a Phonk beat edit</h2><Link href="/studio" className="btn primary big">Open Beat Sync Studio ↗</Link></div>
</main><SiteFooter/></>}

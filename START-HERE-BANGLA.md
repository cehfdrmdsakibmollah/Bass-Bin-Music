# BASS BIN MUSIC v0.4 — বাংলায় শুরু করুন

এটি v0.3 source project-এর ওপর আরও advanced **Auto Director Pro** যোগ করা আপডেটেড release। নতুন ZIP extract করে VS Code-এ খুলুন। Node.js 20.9+ ও npm থাকতে হবে।

```bash
npm install
npm run dev
```

তারপর `http://localhost:3000/studio` খুলে **Assets → Beats → Director → Inspector → Effects → Export** ক্রমে কাজ করুন।

- **Director**: Kick/Snare/Hat focus, beat strength, প্রতি 1/2/4/8 beat-এ auto cuts, Punch/Drift/Orbit/Glide motion, beat quantize, clip snapping, ripple move।
- **Beats**: kick, snare, hat ও bass-drop FX আলাদাভাবে কমানো/বাড়ানো।
- **Inspector**: Video speed, media/text horizontal flip, audio/video fade।
- **Effects**: analog scanlines, neon edge effect এবং cinematic letterbox।
- **Director download buttons**: SRT captions ও CSV clip list। এগুলো আলাদা ফাইল, ভিডিওতে embed নয়।
- **Preview controls**: আগের/পরের beat বা পরের bass-drop-এ যেতে পারবেন।

Auto Director আপনার দেওয়া media ব্যবহার করে—নতুন footage বানায় না। BPM ও drop detection নিখুঁত নাও হতে পারে। কোনো নতুন video edit করার আগে original project JSON backup রাখুন; Undo ব্যবহার করে Auto Director montage ফেরানো যায়।

**পরীক্ষা:** source-level automated tests ৩৭/৩৭ পাস। কিন্তু এই environment-এ npm install এবং real browser export verify করা যায়নি। নিজের Windows/Chrome-এ ১০–২০ সেকেন্ডের video export করে sound sync পরীক্ষা করুন।

বিশদ তথ্য: `docs/AUTO-DIRECTOR-PRO-V04.md`, `docs/TEST-RESULTS-V04.md`.

---

# BASS BIN MUSIC v0.3 — বাংলা Quick Start

## কী যোগ করা হয়েছে?

Music-to-video beat synchronization, Phonk-style hard/drift/cinematic/minimal reactive FX, drum transient marker, manual tap-BPM grid, auto-cut visual montage, bass-drop caption animation, 20ms timing adjustment, CSV marker export এবং আগের Studio-র সব template / spectrum / keyframe controls।

## Windows-এ চালাতে

1. ZIP Extract করে `bass-bin-music` folder VS Code-এ খুলুন।
2. VS Code Terminal-এ লিখুন: `npm install` (প্রথমবার internet প্রয়োজন)।
3. তারপর: `npm run dev`
4. Browser-এ খুলুন: `http://localhost:3000/studio`

## Beat দিয়ে Phonk video বানাতে

1. **Assets** → নিজের MP3/WAV upload করুন। Browser audio decode করতে পারলে beat markers auto-generate হবে।
2. **Beats** tab → Hard Phonk / Drift Shake / Cinematic Drop / Minimal style বেছে নিন।
3. গান চালিয়ে দেখুন beat সামান্য আগে/পরে হলে offset বা ±20ms nudge করুন। ভুল detection হলে beat manually add/remove করুন।
4. **Assets** → ২–৫টি ছবি বা video upload করুন।
5. **Beats** → Cuts every 1/2/4/8 beats + Transition পছন্দ করে **Generate Beat-Synced Cuts** চাপুন। আগে থেকে timeline clips থাকলে বদলে যাবে; Undo করে আগের timeline ফেরানো যাবে।
6. Bass drop-এ playhead রেখে **Toggle bass-drop** ও **Generate drop captions** চাপুন।
7. Vertical Shorts-এর জন্য **9:16** দিন। Preview play করে camera shake/flash/zoom যাচাই করুন।
8. Browser-supported video export দিন এবং downloaded file খুলে audio sync পরীক্ষা করুন।

### মনে রাখবেন

- Beat/BPM/drop হলো **অনুমান**—শতভাগ accurate নয়।
- Source audio, ছবি, video server-এ automatic upload হয় না।
- 35 MB পর্যন্ত decodable audio-তে offline PCM analysis চেষ্টা করা হয়, বড় audio file-এ analysis unavailable হতে পারে।
- নতুন Beat-Sync মূল Next.js `/studio`-তে; `demo/` folder-এর lite offline preview-তে নয়।
- আগের v0.2-এর saved project JSON compatible, media byte JSON export-এ থাকে না।
- এই source package-এর full Next.js production build ও real browser MediaRecorder export এই environment-এ verify করা যায়নি।
- Publishing-এর আগে নিজের file দিয়ে Chrome/Edge এবং mobile browser-এ preview ও export পরীক্ষা করতে হবে।

const active = (track, time) => !track.hidden && time >= track.start && time <= track.start + track.duration;
const mix = (a, b, t) => a + (b - a) * t;
function cover(ctx, media, w, h) {
    const mw = media instanceof HTMLImageElement ? media.naturalWidth : media.videoWidth;
    const mh = media instanceof HTMLImageElement ? media.naturalHeight : media.videoHeight;
    if (!mw || !mh)
        return;
    const scale = Math.max(w / mw, h / mh), dx = (w - mw * scale) / 2, dy = (h - mh * scale) / 2;
    ctx.drawImage(media, dx, dy, mw * scale, mh * scale);
}
function rand(seed) { const v = Math.sin(seed * 127.1 + 78.233) * 43758.5453123; return v - Math.floor(v); }
export function drawFrame(ctx, settings, tracks, audioData, time, media) {
    const { width: w, height: h } = ctx.canvas;
    const min = Math.min(w, h), spectrum = tracks.some(t => t.kind === 'visualizer' && active(t, time));
    const effects = tracks.some(t => t.kind === 'effect' && active(t, time));
    const bass = (audioData.length ? audioData.slice(0, Math.min(25, audioData.length)).reduce((a, b) => a + b, 0) / (Math.min(25, audioData.length) * 255) : 0);
    const level = audioData.some(v => v > 0) ? bass : 0.13 + Math.sin(time * 2.7) * .045;
    const wobble = effects ? (level * settings.shake / 100 * min * .07) : 0;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = settings.background;
    ctx.fillRect(0, 0, w, h);
    ctx.translate(Math.sin(time * 13) * wobble, Math.cos(time * 17) * wobble);
    const scale = 1 + (effects ? settings.zoom / 1300 * (1 + level) : 0);
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);
    const grad = ctx.createRadialGradient(w * .5, h * .47, 0, w * .5, h * .48, Math.max(w, h) * .68);
    grad.addColorStop(0, '#142342');
    grad.addColorStop(.52, '#0b1024');
    grad.addColorStop(1, settings.background);
    ctx.fillStyle = grad;
    ctx.fillRect(-20, -20, w + 40, h + 40);
    for (const track of tracks) {
        if ((track.kind === 'image' || track.kind === 'video') && track.assetId && active(track, time)) {
            const item = media.get(track.assetId);
            if (item) {
                ctx.save();
                ctx.globalAlpha = .68;
                cover(ctx, item, w, h);
                ctx.fillStyle = 'rgba(4,6,17,.28)';
                ctx.fillRect(0, 0, w, h);
                ctx.restore();
            }
        }
    }
    const ambient = ctx.createRadialGradient(w * .28, h * .57, 0, w * .28, h * .57, w * .58);
    ambient.addColorStop(0, settings.secondary + '45');
    ambient.addColorStop(1, 'transparent');
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, w, h);
    const ambient2 = ctx.createRadialGradient(w * .76, h * .38, 0, w * .76, h * .38, w * .5);
    ambient2.addColorStop(0, settings.primary + '43');
    ambient2.addColorStop(1, 'transparent');
    ctx.fillStyle = ambient2;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(102,154,211,.10)';
    ctx.lineWidth = Math.max(1, min / 720);
    const grid = Math.max(20, Math.round(min / 14));
    for (let x = 0; x < w; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    if (effects) {
        for (let i = 0; i < Math.round(settings.particles * 1.4); i++) {
            const x = rand(i * 9.7) * w, y = ((rand(i * 3.3) * h + time * (7 + rand(i * 5) * 21)) % h);
            ctx.globalAlpha = .12 + rand(i + 9) * .38;
            ctx.fillStyle = i % 3 === 0 ? settings.secondary : settings.primary;
            ctx.beginPath();
            ctx.arc(x, y, min * (.00075 + rand(i + 7) * .0023), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    if (spectrum) {
        const strength = settings.intensity / 100;
        const count = 64;
        ctx.save();
        ctx.shadowColor = settings.primary;
        ctx.shadowBlur = effects ? settings.glow / 100 * min * .05 : 0;
        const amp = (i) => Math.max(.06, audioData.length ? audioData[Math.floor(i / count * audioData.length)] / 255 : 0.15) * (0.5 + strength * .85);
        if (settings.mode === 'bars') {
            const span = w * .65, gap = span / count, x0 = (w - span) / 2, bar = span / count * .68, base = h * .70;
            for (let i = 0; i < count; i++) {
                const hh = (h * .26) * amp(i) * (0.7 + level * .8);
                const x = x0 + i * span / count;
                const g = ctx.createLinearGradient(x, base - hh, x, base + hh * .5);
                g.addColorStop(0, settings.primary);
                g.addColorStop(1, settings.secondary);
                ctx.fillStyle = g;
                ctx.fillRect(x, base - hh, bar, hh + 4);
                ctx.globalAlpha = .24;
                ctx.fillRect(x, base + 9, bar, hh * .32);
                ctx.globalAlpha = 1;
            }
        }
        else if (settings.mode === 'circle') {
            const cx = w * .5, cy = h * .49, r = min * .19;
            for (let i = 0; i < count * 2; i++) {
                const a = i / (count * 2) * Math.PI * 2, hh = min * .18 * amp(i % count) * (1 + level * .4);
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
                ctx.lineTo(cx + Math.cos(a) * (r + hh), cy + Math.sin(a) * (r + hh));
                ctx.lineWidth = Math.max(2, min * .005);
                ctx.strokeStyle = i % 2 ? settings.primary : settings.secondary;
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(cx, cy, r * .89, 0, Math.PI * 2);
            ctx.lineWidth = min * .004;
            ctx.strokeStyle = settings.secondary;
            ctx.stroke();
        }
        else if (settings.mode === 'wave') {
            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                ctx.lineWidth = Math.max(3, min * .004);
                ctx.strokeStyle = j === 1 ? settings.secondary : settings.primary;
                for (let i = 0; i <= 200; i++) {
                    const x = i / 200 * w, s = amp(Math.floor(i / 200 * (count - 1)));
                    const y = h * .56 + Math.sin(i * .095 + time * 2.8 + j) * s * min * .23 * (1 - j * .21);
                    if (i === 0)
                        ctx.moveTo(x, y);
                    else
                        ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }
        else {
            for (let i = 0; i < 190; i++) {
                const a = rand(i * 4.22) * Math.PI * 2 + time * .07;
                const r = min * (.05 + rand(i * 13) * .38) * (1 + level * .35);
                const x = w * .5 + Math.cos(a) * r, y = h * .49 + Math.sin(a) * r * .7;
                const size = min * (.001 + rand(i * 2.2) * .004) * (1 + level * 3);
                ctx.fillStyle = i % 2 ? settings.secondary : settings.primary;
                ctx.fillRect(x, y, size, size);
            }
        }
        ctx.restore();
    }
    for (const track of tracks) {
        if (track.kind === 'text' && active(track, time)) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.shadowBlur = min * .045;
            ctx.shadowColor = settings.secondary;
            ctx.font = `900 ${Math.round(min * .063)}px Arial,sans-serif`;
            const value = (track.text || settings.title).slice(0, 64);
            ctx.fillStyle = '#fff';
            ctx.fillText(value, w * .5, h * .23, w * .88);
            ctx.restore();
        }
    }
    ctx.font = `bold ${Math.round(min * .019)}px Arial,sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(240,248,255,.52)';
    ctx.fillText('BASS BIN MUSIC  •  CREATE YOUR FREQUENCY', w / 2, h * .93, w * .88);
    ctx.restore();
}

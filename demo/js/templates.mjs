export const templates = [
    { slug: 'dark-drift', name: 'Dark Drift Phonk', category: 'Drift', description: 'Low-key street energy with red neon and heavyweight bass bars.', colors: ['#ff315c', '#af48ff'], mode: 'bars', energy: 85, tags: ['cars', 'drift', 'dark'] },
    { slug: 'brazilian-phonk', name: 'Brazilian Phonk', category: 'Phonk', description: 'High-energy cyan and green motion for Brazilian phonk edits.', colors: ['#00f4d1', '#a6ff47'], mode: 'circle', energy: 95, tags: ['brazilian', 'funk', 'bass'] },
    { slug: 'jdm-night-drive', name: 'JDM Night Drive', category: 'Automotive', description: 'Midnight blue highways, magenta waveform and Tokyo-inspired night visuals.', colors: ['#36e8ff', '#e448ff'], mode: 'wave', energy: 76, tags: ['jdm', 'night', 'car'] },
    { slug: 'neon-city', name: 'Neon City', category: 'Neon', description: 'Electric cyan spectra and purple city-night glows.', colors: ['#10f1ff', '#9c57ff'], mode: 'bars', energy: 80, tags: ['city', 'glow', 'phonk'] },
    { slug: 'anime-vibes', name: 'Anime Vibes', category: 'Anime', description: 'Soft neon sound waves with editable image overlays for licensed artwork.', colors: ['#ff6bce', '#65c6ff'], mode: 'wave', energy: 60, tags: ['anime', 'lofi', 'wave'] },
    { slug: 'horror-cinematic', name: 'Horror Cinematic', category: 'Dark', description: 'Atmospheric low-frequency particles, dark crimson and eerie motion.', colors: ['#e82546', '#8124bf'], mode: 'particles', energy: 68, tags: ['horror', 'cinematic'] },
    { slug: 'skull-visualizer', name: 'Skull Visualizer', category: 'Dark', description: 'Heavy circular reactive spectrum with an intense violet-red palette.', colors: ['#ee497a', '#8351ff'], mode: 'circle', energy: 92, tags: ['skull', 'heavy'] },
    { slug: 'retro-wave', name: 'Retro Wave', category: 'Retro', description: 'Synthwave-inspired horizon, pink and blue nighttime sound waves.', colors: ['#fa4cc7', '#47c5ff'], mode: 'wave', energy: 62, tags: ['retro', 'synthwave'] },
    { slug: 'bass-boost', name: 'Bass Boost', category: 'Bass', description: 'Punchy high-contrast equalizer bars for beat-heavy releases.', colors: ['#ff4667', '#00e7ff'], mode: 'bars', energy: 100, tags: ['bass', 'boost'] },
    { slug: 'minimal-spectrum', name: 'Minimal Music Spectrum', category: 'Clean', description: 'Simple restrained circle spectrum for polished music releases.', colors: ['#e9edff', '#62cafa'], mode: 'circle', energy: 38, tags: ['minimal', 'spectrum'] }
];
export const defaultSettings = {
    aspect: '16:9', fps: 30, width: 1280, mode: 'bars', primary: '#22e9ff', secondary: '#fb4ec9',
    intensity: 75, glow: 72, shake: 12, particles: 38, zoom: 6, title: 'FEEL THE FREQUENCY', background: '#080915'
};
export function createProject(seed = Date.now()) {
    return {
        schemaVersion: 1, id: `bbm-${seed}`, name: 'Untitled Phonk Project', template: 'neon-city', createdAt: seed, updatedAt: seed, duration: 20,
        settings: { ...defaultSettings }, tracks: [
            { id: 'visualizer', kind: 'visualizer', label: 'Audio Spectrum', start: 0, duration: 20, hidden: false, muted: false },
            { id: 'title', kind: 'text', label: 'Title overlay', start: 0, duration: 20, hidden: false, muted: false, text: 'FEEL THE FREQUENCY' },
            { id: 'fx', kind: 'effect', label: 'Glow effects', start: 0, duration: 20, hidden: false, muted: false }
        ]
    };
}
export function applyTemplate(project, slug) {
    const template = templates.find(t => t.slug === slug);
    if (!template)
        return project;
    return { ...project, template: slug, updatedAt: Date.now(), settings: { ...project.settings, primary: template.colors[0], secondary: template.colors[1], mode: template.mode, intensity: template.energy } };
}

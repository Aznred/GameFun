// ─── Moteur sonore — Card Game UI Sounds ─────────────────────────────────────
// 100% Web Audio API, zero fichiers externes.
// Sons modernes et propres style jeu de cartes (Hearthstone / Solitaire).

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function setSoundEnabled(v: boolean) { enabled = v; }
export function isSoundEnabled() { return enabled; }

// ─── Primitives ───────────────────────────────────────────────────────────────

function tone(
  ac: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.35,
  fadeOut = 0.08,
): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.008);
  gain.gain.setValueAtTime(gainPeak, startTime + duration - fadeOut);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

function chord(
  ac: AudioContext,
  freqs: number[],
  startTime: number,
  duration: number,
  type: OscillatorType = 'triangle',
  gainPeak = 0.22,
): void {
  freqs.forEach((f) => tone(ac, f, startTime, duration, type, gainPeak / freqs.length * 2.2));
}

function sweep(
  ac: AudioContext,
  freqFrom: number,
  freqTo: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.28,
): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, startTime);
  osc.frequency.exponentialRampToValueAtTime(freqTo, startTime + duration);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

function noiseBuffer(ac: AudioContext): AudioBuffer {
  const buf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noiseClick(ac: AudioContext, startTime: number, duration = 0.04, gain = 0.15): void {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  const gainNode = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 1.2;
  src.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ac.destination);
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  src.start(startTime);
  src.stop(startTime + duration + 0.01);
}

// ─── Notes helper (A4 = 440 Hz) ───────────────────────────────────────────────

function note(n: number): number {
  return 440 * Math.pow(2, n / 12);
}
// n=0 → A4, n=3 → C5, n=5 → D5, n=7 → E5, n=12 → A5
// Major scale relative to C4: C=0, D=2, E=4, F=5, G=7, A=9, B=11

function cn(semitones: number): number {
  // relative to C4 (261.63 Hz)
  return 261.63 * Math.pow(2, semitones / 12);
}

// ─── Public sounds ────────────────────────────────────────────────────────────

/** Clic de bouton — petit pop satisfaisant */
export function playClick(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  tone(ac, cn(12), t, 0.06, 'sine', 0.3, 0.05);
  noiseClick(ac, t, 0.03, 0.08);
}

/** Survol / sélection d'une carte */
export function playCardSelect(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  tone(ac, cn(19), t, 0.07, 'sine', 0.18, 0.05);
}

/** Jouer une carte — whoosh satisfaisant */
export function playCardPlay(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  sweep(ac, cn(7), cn(24), t, 0.12, 'sine', 0.22);
  noiseClick(ac, t + 0.08, 0.06, 0.1);
}

/** Carte posée dans une rangée — tap boisé léger */
export function playCardPlace(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  // Impact percussif
  sweep(ac, cn(4), cn(-2), t, 0.08, 'triangle', 0.25);
  noiseClick(ac, t, 0.05, 0.12);
}

/** Capture d'une rangée — son dramatique cascade */
export function playRowCapture(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  // Descending cascade of notes
  [cn(12), cn(9), cn(7), cn(4), cn(0)].forEach((f, i) => {
    tone(ac, f, t + i * 0.06, 0.14, 'triangle', 0.28, 0.08);
  });
  // Low thud at the end
  sweep(ac, 180, 60, t + 0.28, 0.22, 'sine', 0.35);
  noiseClick(ac, t + 0.28, 0.18, 0.22);
}

/** Gagner des points / bonus positif */
export function playScoreGain(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  [cn(12), cn(16), cn(19)].forEach((f, i) => {
    tone(ac, f, t + i * 0.07, 0.15, 'sine', 0.24, 0.08);
  });
}

/** Ouch — pénalité / erreur */
export function playOuch(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  sweep(ac, cn(5), cn(-3), t, 0.18, 'sawtooth', 0.15);
  sweep(ac, cn(3), cn(-5), t + 0.06, 0.18, 'triangle', 0.18);
}

/** Démarrage de partie — fanfare joyeuse */
export function playGameStart(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  // Ascending arpeggio
  [cn(0), cn(4), cn(7), cn(12), cn(16)].forEach((f, i) => {
    tone(ac, f, t + i * 0.09, 0.22, 'triangle', 0.26, 0.12);
  });
  // Final chord
  chord(ac, [cn(0), cn(7), cn(12), cn(19)], t + 0.52, 0.45, 'sine', 0.52);
}

/** Victoire — arpège triomphant */
export function playVictory(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  // Quick ascending arp
  [cn(0), cn(4), cn(7), cn(12)].forEach((f, i) => {
    tone(ac, f, t + i * 0.1, 0.2, 'triangle', 0.28, 0.1);
  });
  // Big chord
  chord(ac, [cn(0), cn(7), cn(12), cn(16), cn(19)], t + 0.48, 0.7, 'sine', 0.55);
  // Extra sparkle
  [cn(24), cn(28)].forEach((f, i) => {
    tone(ac, f, t + 0.5 + i * 0.12, 0.18, 'sine', 0.2, 0.1);
  });
}

/** Défaite — mélodie descendante triste */
export function playDefeat(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  [cn(7), cn(4), cn(2), cn(0), cn(-3)].forEach((f, i) => {
    tone(ac, f, t + i * 0.1, 0.22, 'triangle', 0.22, 0.12);
  });
  // Final low tone
  tone(ac, cn(-5), t + 0.52, 0.4, 'sine', 0.2, 0.25);
}

/** Un joueur rejoint — notification douce */
export function playPlayerJoin(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  tone(ac, cn(12), t, 0.1, 'sine', 0.22, 0.07);
  tone(ac, cn(16), t + 0.1, 0.12, 'sine', 0.2, 0.08);
}

/** Tick de tension */
export function playTick(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  noiseClick(ac, t, 0.025, 0.18);
  tone(ac, 1800, t, 0.025, 'square', 0.08, 0.02);
}

/** Hover UI — soft arcade tick (for buttons/cards) */
export function playHover(): void {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  tone(ac, cn(19), t, 0.05, 'sine', 0.12, 0.03);
}

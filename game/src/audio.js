// Velvet Vault — sound.
// One clear job: tiny synthesized bleeps through WebAudio. No audio files,
// no network, and silence until the player first interacts with the page.
let ctx = null;
let muted = false;

function ensure() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, gain) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type || 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain || 0.08, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

export function makeSfx() {
  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    pickup() {
      tone(880, 0.09, 'sine', 0.09);
      setTimeout(() => tone(1318, 0.12, 'sine', 0.08), 70);
    },
    toss() {
      tone(520, 0.08, 'triangle', 0.07);
    },
    smoke() {
      tone(220, 0.25, 'sawtooth', 0.04);
    },
    hack() {
      tone(660, 0.08, 'square', 0.05);
      setTimeout(() => tone(990, 0.1, 'square', 0.05), 80);
    },
    spotted() {
      tone(196, 0.16, 'square', 0.08);
    },
    caught() {
      tone(110, 0.5, 'sawtooth', 0.1);
      setTimeout(() => tone(82, 0.6, 'sawtooth', 0.1), 160);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'sine', 0.09), i * 110));
    },
  };
}

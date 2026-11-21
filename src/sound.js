/* Synthesized sound effects (Web Audio) — no audio files. Starts on the first tap (browser rule). */
(function (root) {
  let ctx = null, master = null, noiseBuf = null, on = true, last = {};
  try { on = localStorage.getItem('holdem_sound') !== 'off'; } catch (e) { }
  function init() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return false;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.6;
      const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  function ok(name, gap) { const t = Date.now(); if (last[name] && t - last[name] < (gap || 0)) return false; last[name] = t; return on && init(); }
  // filtered noise burst (card slap / swish)
  function noise(t, dur, freq, q, vol, type, sweepTo) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq, t); if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur); f.Q.value = q || 1;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.2, dur + 0.02);
  }
  // pitched ping (chip clink / UI blip)
  function tone(t, freq, dur, vol, type, endFreq) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
  }
  function clink(t, vol) { const b = 2200 + Math.random() * 1400; tone(t, b, 0.09, vol * 0.5, 'triangle'); tone(t, b * 1.52, 0.07, vol * 0.3, 'sine'); noise(t, 0.03, 5200, 2, vol * 0.5, 'highpass'); }
  const S = {
    click() { if (!ok('click', 30)) return; const t = ctx.currentTime; tone(t, 760, 0.05, 0.16, 'square', 520); noise(t, 0.02, 3000, 1, 0.1, 'highpass'); },
    deal(delay) { if (!ok('deal', 0)) return; const t = ctx.currentTime + (delay || 0); noise(t, 0.07, 2600, 0.8, 0.5, 'bandpass', 900); noise(t + 0.045, 0.03, 1200, 1, 0.25, 'lowpass'); },
    flip() { if (!ok('flip', 40)) return; const t = ctx.currentTime; noise(t, 0.09, 4200, 0.7, 0.32, 'bandpass', 1500); },
    chips(n) { if (!ok('chips', 60)) return; const t = ctx.currentTime, k = Math.max(2, Math.min(6, n || 3)); for (let i = 0; i < k; i++) clink(t + i * (0.035 + Math.random() * 0.03), 0.5 - i * 0.04); },
    allin() { if (!ok('allin', 200)) return; const t = ctx.currentTime; for (let i = 0; i < 12; i++) clink(t + i * 0.045 + Math.random() * 0.02, 0.55); tone(t, 110, 0.35, 0.3, 'sine', 70); },
    check() { if (!ok('check', 80)) return; const t = ctx.currentTime; tone(t, 190, 0.07, 0.5, 'sine', 120); tone(t + 0.11, 170, 0.08, 0.45, 'sine', 110); noise(t, 0.03, 700, 1, 0.3, 'lowpass'); noise(t + 0.11, 0.03, 700, 1, 0.3, 'lowpass'); },
    fold() { if (!ok('fold', 80)) return; const t = ctx.currentTime; noise(t, 0.22, 1800, 0.6, 0.3, 'bandpass', 500); },
    turn() { if (!ok('turn', 400)) return; const t = ctx.currentTime; tone(t, 880, 0.18, 0.2, 'sine'); tone(t + 0.12, 1320, 0.3, 0.18, 'sine'); },
    win() { if (!ok('win', 500)) return; const t = ctx.currentTime;[523, 659, 784, 1047].forEach((f, i) => { tone(t + i * 0.09, f, 0.35, 0.2, 'triangle'); tone(t + i * 0.09, f * 2, 0.25, 0.05, 'sine'); }); for (let i = 0; i < 5; i++) clink(t + 0.35 + i * 0.05, 0.4); },
    level() { if (!ok('level', 500)) return; const t = ctx.currentTime; tone(t, 440, 0.12, 0.2, 'square'); tone(t + 0.13, 587, 0.12, 0.2, 'square'); tone(t + 0.26, 740, 0.2, 0.2, 'square'); },
    shuffle() { if (!ok('shuffle', 300)) return; const t = ctx.currentTime; for (let i = 0; i < 9; i++) noise(t + i * 0.045, 0.05, 2400 + Math.random() * 1500, 0.8, 0.28, 'bandpass'); },
  };
  root.Snd = {
    play(n, a) { try { if (S[n]) S[n](a); } catch (e) { } },
    unlock() { if (on) try { init(); } catch (e) { } },
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('holdem_sound', on ? 'on' : 'off'); } catch (e) { } if (on) { init(); S.click(); } return on; },
  };
})(typeof window !== 'undefined' ? window : globalThis);

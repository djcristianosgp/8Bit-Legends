import { getBiomeConfig } from '../maps/biomeConfig';

export const AUDIO_ASSETS = {
  'sfx-ui-click': '/assets/sounds/click_003.ogg',
  'sfx-ui-close': '/assets/sounds/close_002.ogg',
  'sfx-ui-confirm': '/assets/sounds/confirmation_002.ogg',
  'sfx-item-drop': '/assets/sounds/drop_002.ogg',
  'sfx-hit': '/assets/sounds/tick_002.ogg',
  'sfx-fireball': '/assets/sounds/switch_004.ogg',
  'sfx-lightning': '/assets/sounds/glitch_003.ogg',
  'sfx-aura': '/assets/sounds/maximize_004.ogg',
  'sfx-error': '/assets/sounds/error_003.ogg',
};

const MUSIC_PROFILES = {
  explore: [196, 293.66],
  combat: [220, 329.63],
  boss: [164.81, 246.94],
};

const AMBIENT_PROFILES = {
  starter_field: [329.63, 392],
  forest: [261.63, 349.23],
  ruins: [174.61, 261.63],
  volcano: [146.83, 196],
  crystal: [392, 523.25],
};

const getSharedAudioContext = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  if (!window.__eightBitLegendsAudioContext) {
    window.__eightBitLegendsAudioContext = new AudioCtx();
  }

  return window.__eightBitLegendsAudioContext;
};

export class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.ambientGain = null;
    this.currentMusicState = '';
    this.musicNodes = [];
    this.ambientNodes = [];
    this.unlockHandler = () => this.resume();
  }

  create({ phase = 1, weatherType = 'day' }) {
    this.context = getSharedAudioContext();
    if (!this.context) {
      return;
    }

    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.ambientGain = this.context.createGain();

    this.masterGain.gain.value = 0.038;
    this.musicGain.gain.value = 0.34;
    this.ambientGain.gain.value = 0.3;

    this.musicGain.connect(this.masterGain);
    this.ambientGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this.unlockHandler, { once: true });
      window.addEventListener('keydown', this.unlockHandler, { once: true });
    }

    this.setAmbient(getBiomeConfig(phase)?.name ?? 'starter_field', weatherType);
    this.setMusicState('explore');
  }

  resume() {
    this.context?.resume?.().catch(() => {});
  }

  hasLoadedAsset(key) {
    return Boolean(this.scene?.cache?.audio?.exists(key));
  }

  playLoadedEffect(key, config = {}) {
    if (!this.scene?.sound || !this.hasLoadedAsset(key)) {
      return false;
    }

    this.scene.sound.play(key, {
      volume: config.volume ?? 0.2,
      rate: config.rate ?? 1,
      detune: config.detune ?? 0,
    });

    return true;
  }

  createOscillator(freq, type, gainValue, destination) {
    if (!this.context || !destination) {
      return null;
    }

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(destination);
    osc.start();
    return { osc, gain };
  }

  createNoise(gainValue) {
    if (!this.context || !this.ambientGain) {
      return null;
    }

    const bufferSize = this.context.sampleRate * 2;
    const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = (Math.random() * 2 - 1) * 0.45;
    }

    const source = this.context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;

    const gain = this.context.createGain();
    gain.gain.value = gainValue;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    source.start();
    return { source, gain, filter };
  }

  stopNodes(nodes = []) {
    nodes.forEach((node) => {
      try {
        node.gain?.gain?.linearRampToValueAtTime(0.0001, this.context.currentTime + 0.16);
        node.osc?.stop?.(this.context.currentTime + 0.18);
        node.source?.stop?.(this.context.currentTime + 0.18);
      } catch {
        // noop
      }
    });
  }

  setAmbient(biomeName = 'starter_field', weatherType = 'day') {
    if (!this.context) {
      return;
    }

    this.stopNodes(this.ambientNodes);
    this.ambientNodes = [];

    const profile = AMBIENT_PROFILES[biomeName] ?? AMBIENT_PROFILES.starter_field;
    const ambientA = this.createOscillator(profile[0], 'triangle', 0.008, this.ambientGain);
    const ambientB = this.createOscillator(profile[1], 'sine', 0.005, this.ambientGain);

    if (ambientA) {
      this.ambientNodes.push(ambientA);
    }
    if (ambientB) {
      this.ambientNodes.push(ambientB);
    }

    if (weatherType === 'rain') {
      const rainNoise = this.createNoise(0.02);
      if (rainNoise) {
        this.ambientNodes.push(rainNoise);
      }
    }
  }

  setMusicState(state = 'explore') {
    if (!this.context || this.currentMusicState === state) {
      return;
    }

    this.currentMusicState = state;
    this.stopNodes(this.musicNodes);
    this.musicNodes = [];

    const profile = MUSIC_PROFILES[state] ?? MUSIC_PROFILES.explore;
    const nodeA = this.createOscillator(profile[0], 'sawtooth', 0.012, this.musicGain);
    const nodeB = this.createOscillator(profile[1], 'triangle', 0.008, this.musicGain);

    if (nodeA) {
      this.musicNodes.push(nodeA);
    }
    if (nodeB) {
      this.musicNodes.push(nodeB);
    }
  }

  update({ statusLabel = 'Explorando' } = {}) {
    if (!this.context) {
      return;
    }

    const nextState = /boss/i.test(statusLabel)
      ? 'boss'
      : /combate/i.test(statusLabel)
        ? 'combat'
        : 'explore';

    this.setMusicState(nextState);
  }

  setPaused(paused) {
    if (!this.masterGain || !this.context) {
      return;
    }

    const target = paused ? 0.008 : 0.038;
    this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(target, this.context.currentTime + 0.12);
  }

  playUiClick() {
    this.resume();
    this.playLoadedEffect('sfx-ui-click', { volume: 0.16, rate: 1 });
  }

  playUiClose() {
    this.resume();
    if (!this.playLoadedEffect('sfx-ui-close', { volume: 0.16, rate: 1 })) {
      this.playLoadedEffect('sfx-ui-click', { volume: 0.14, rate: 0.92 });
    }
  }

  playUiConfirm() {
    this.resume();

    if (this.playLoadedEffect('sfx-ui-confirm', { volume: 0.22, rate: 1 })) {
      return;
    }

    if (!this.context || !this.masterGain) {
      return;
    }

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'square';
    osc.frequency.value = 660;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.12);
    osc.stop(this.context.currentTime + 0.14);
  }

  playLootPickup() {
    this.resume();
    this.playLoadedEffect('sfx-item-drop', { volume: 0.2, rate: 1.04 });
  }

  playHit() {
    this.resume();
    this.playLoadedEffect('sfx-hit', {
      volume: 0.14,
      rate: 0.96 + Math.random() * 0.12,
    });
  }

  playSkillCast(skillKey) {
    this.resume();

    const soundMap = {
      fireball: 'sfx-fireball',
      lightning: 'sfx-lightning',
      aura: 'sfx-aura',
    };

    const key = soundMap[skillKey];
    if (!key) {
      return;
    }

    const configMap = {
      fireball: { volume: 0.18, rate: 1.08 },
      lightning: { volume: 0.22, rate: 1 },
      aura: { volume: 0.18, rate: 0.98 },
    };

    this.playLoadedEffect(key, configMap[skillKey]);
  }

  playError() {
    this.resume();
    this.playLoadedEffect('sfx-error', { volume: 0.17, rate: 1 });
  }

  playPhaseClear() {
    this.resume();
    const usedLoadedSound = this.playLoadedEffect('sfx-ui-confirm', { volume: 0.26, rate: 1.1 });

    if (usedLoadedSound || !this.context || !this.masterGain) {
      return;
    }

    [523.25, 659.25].forEach((freq, index) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = 0.018;
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.context.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.2 + index * 0.08);
      osc.stop(this.context.currentTime + 0.22 + index * 0.08);
    });
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', this.unlockHandler);
      window.removeEventListener('keydown', this.unlockHandler);
    }

    this.stopNodes(this.musicNodes);
    this.stopNodes(this.ambientNodes);
    this.musicNodes = [];
    this.ambientNodes = [];
    this.musicGain?.disconnect?.();
    this.ambientGain?.disconnect?.();
    this.masterGain?.disconnect?.();
  }
}

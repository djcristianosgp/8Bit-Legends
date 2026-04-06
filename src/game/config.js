import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { OverlayScene } from './scenes/OverlayScene';

export const getDeviceProfile = () => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTouch: false,
      quality: 'high',
      reducedEffects: false,
      targetFps: 60,
      preferredZoom: 1.08,
      pixelRatio: 1,
    };
  }

  const width = window.innerWidth || 800;
  const height = window.innerHeight || 600;
  const isTouch = window.matchMedia?.('(pointer: coarse)')?.matches || navigator.maxTouchPoints > 0;
  const isMobile = isTouch || Math.min(width, height) < 820;
  const lowPowerDevice = (navigator.hardwareConcurrency ?? 8) <= 4 || (navigator.deviceMemory ?? 8) <= 4;
  const reducedEffects = isMobile || lowPowerDevice;

  return {
    isMobile,
    isTouch,
    quality: reducedEffects ? 'medium' : 'high',
    reducedEffects,
    targetFps: isMobile ? 45 : 60,
    preferredZoom: isMobile ? (Math.min(width, height) < 460 ? 0.82 : 0.92) : 1.08,
    pixelRatio: Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2),
  };
};

export const createGameConfig = (parent) => {
  const deviceProfile = getDeviceProfile();

  return {
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    resolution: deviceProfile.pixelRatio,
    backgroundColor: '#101725',
    render: {
      powerPreference: 'high-performance',
      antialiasGL: false,
      desynchronized: deviceProfile.isMobile,
    },
    fps: {
      target: deviceProfile.targetFps,
      min: 20,
      forceSetTimeOut: deviceProfile.isMobile,
      smoothStep: true,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 480,
      min: {
        width: 320,
        height: 240,
      },
      max: {
        width: 1280,
        height: 768,
      },
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('deviceProfile', deviceProfile);
      },
    },
    scene: [MainScene, OverlayScene],
  };
};

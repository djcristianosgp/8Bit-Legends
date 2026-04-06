import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const createGameConfig = (parent) => ({
  type: Phaser.AUTO,
  parent,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  backgroundColor: '#101725',
  render: {
    powerPreference: 'high-performance',
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 480,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [MainScene],
});

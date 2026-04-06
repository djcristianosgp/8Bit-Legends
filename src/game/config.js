import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const createGameConfig = (parent) => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#101725',
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

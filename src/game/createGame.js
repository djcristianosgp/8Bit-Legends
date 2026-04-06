import Phaser from 'phaser';
import { createGameConfig } from './config';

export const createGame = (parentElement) => {
  return new Phaser.Game(createGameConfig(parentElement));
};

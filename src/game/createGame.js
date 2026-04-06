import Phaser from 'phaser';
import { createGameConfig } from './config';
import { createSaveBridge } from './save/saveBridge';

export const createGame = (parentElement) => {
  const game = new Phaser.Game(createGameConfig(parentElement));
  const saveBridge = createSaveBridge(game);
  return { game, saveBridge };
};

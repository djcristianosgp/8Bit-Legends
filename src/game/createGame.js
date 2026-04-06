import Phaser from 'phaser';
import { createGameConfig, getDeviceProfile } from './config';
import { createSaveBridge } from './save/saveBridge';
import { createGameStateStore } from './state/gameState';
import { createSocketSync } from './net/socketSync';

export const createGame = (parentElement, options = {}) => {
  const playerName = (options.playerName ?? 'Heroi').trim() || 'Heroi';
  const stateStore = createGameStateStore({ playerName });
  const socketSync = createSocketSync({ stateStore });

  const game = new Phaser.Game(createGameConfig(parentElement));

  game.registry.set('playerName', playerName);
  game.registry.set('stateStore', stateStore);
  game.registry.set('socketSync', socketSync);
  game.registry.set('deviceProfile', getDeviceProfile());

  const saveBridge = createSaveBridge(game);
  return { game, saveBridge, stateStore, socketSync };
};

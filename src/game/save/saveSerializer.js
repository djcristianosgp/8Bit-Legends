import { SAVE_VERSION } from './saveSchema';

export const serializeScene = (scene) => ({
  version: SAVE_VERSION,
  timestamp: Date.now(),
  phase: scene.startPhase ?? 1,
  mapId: scene.currentMapId ?? 'phase-1',
  playerName: scene.playerName ?? 'Heroi',
  player: {
    x: Math.round(scene.player.x),
    y: Math.round(scene.player.y),
    facing: scene.facing,
    stats: {
      maxHealth: scene.player.stats.maxHealth,
      health: scene.player.stats.health,
      attack: scene.player.stats.attack,
      defense: scene.player.stats.defense,
      bonusAttack: scene.player.stats.bonusAttack,
      bonusSpeed: scene.player.stats.bonusSpeed,
    },
  },
  inventory: { ...scene.inventory },
  weapon: scene.weaponSystem?.serialize() ?? null,
});

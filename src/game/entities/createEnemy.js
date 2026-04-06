import { createCombatStats } from '../combat/stats';
import { createEnemyAiState } from '../ai/enemyBehavior';

/**
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {number} [difficultyFactor=1] - multiplicador de dificuldade da fase
 */
export const createEnemy = (scene, x, y, difficultyFactor = 1) => {
  const enemy = scene.physics.add.sprite(x, y, 'player', 0);
  enemy.setScale(2);
  enemy.setTint(0xff8080);
  enemy.setDepth(2);

  const body = enemy.body;
  body.setCollideWorldBounds(true);
  body.setSize(10, 14);
  body.setOffset(11, 17);
  body.setMaxVelocity(140, 140);

  enemy.isBoss = false;

  enemy.stats = createCombatStats({
    maxHealth: Math.round(45 * difficultyFactor),
    attack: Math.round(11 * difficultyFactor),
    defense: Math.round(2 * difficultyFactor),
  });

  enemy.ai = createEnemyAiState(scene.time.now);
  enemy.lastReceivedHitAt = -10000;
  enemy.lastContactDamageAt = -10000;

  return enemy;
};

import { createCombatStats } from '../combat/stats';
import { createEnemyAiState } from '../ai/enemyBehavior';

export const createEnemy = (scene, x, y) => {
  const enemy = scene.physics.add.sprite(x, y, 'player', 0);
  enemy.setScale(2);
  enemy.setTint(0xff8080);
  enemy.setDepth(2);

  const body = enemy.body;
  body.setCollideWorldBounds(true);
  body.setSize(10, 14);
  body.setOffset(11, 17);
  body.setMaxVelocity(140, 140);

  enemy.stats = createCombatStats({
    maxHealth: 45,
    attack: 11,
    defense: 2,
  });

  enemy.ai = createEnemyAiState(scene.time.now);
  enemy.lastReceivedHitAt = -10000;
  enemy.lastContactDamageAt = -10000;

  return enemy;
};

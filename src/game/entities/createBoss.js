import { createCombatStats } from '../combat/stats';

/**
 * Cria um boss no ponto indicado, com stats escalados pelo fator de dificuldade.
 * O boss usa o mesmo spritesheet do player, escala maior e tint vermelho escuro.
 * O campo `isBoss = true` é usado pelo sistema de IA e de colisão.
 */
export const createBoss = (scene, x, y, difficultyFactor = 1) => {
  const boss = scene.physics.add.sprite(x, y, 'player', 0);
  boss.setScale(3.5);
  boss.setTint(0xaa1111);
  boss.setDepth(3);

  const body = boss.body;
  body.setCollideWorldBounds(true);
  body.setSize(10, 14);
  body.setOffset(11, 17);
  body.setMaxVelocity(320, 320);

  boss.isBoss = true;

  boss.stats = createCombatStats({
    maxHealth: Math.round(200 * difficultyFactor),
    attack: Math.round(22 * difficultyFactor),
    defense: Math.round(8 * difficultyFactor),
  });

  // Estado de IA do boss (gerenciado por bossBehavior.js)
  boss.ai = {
    bossMode: 'chase',
    direction: { x: 0, y: 0 },
    nextDirectionChangeAt: scene.time.now + 500,
    nextChargeAt: scene.time.now + 3000,
    chargeEndAt: 0,
    nextStompAt: scene.time.now + 5000,
    stompEndAt: 0,
  };

  boss.lastReceivedHitAt = -10000;
  boss.lastContactDamageAt = -10000;

  return boss;
};

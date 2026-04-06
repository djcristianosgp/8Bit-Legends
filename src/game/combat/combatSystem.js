import Phaser from 'phaser';
import { applyDamage, calculateDamage, isDead } from './stats';

const ATTACK_RANGE = 36;
const ATTACK_ARC = Math.PI / 2.8;

const facingToVector = (facing) => {
  const vectors = {
    down: new Phaser.Math.Vector2(0, 1),
    up: new Phaser.Math.Vector2(0, -1),
    left: new Phaser.Math.Vector2(-1, 0),
    right: new Phaser.Math.Vector2(1, 0),
  };

  return vectors[facing] ?? vectors.down;
};

const isEnemyInsideAttackCone = (player, enemy, facing) => {
  const toEnemy = new Phaser.Math.Vector2(enemy.x - player.x, enemy.y - player.y);
  const distance = toEnemy.length();

  if (distance > ATTACK_RANGE || distance === 0) {
    return false;
  }

  const facingVec = facingToVector(facing);
  const enemyDir = toEnemy.normalize();
  const dot = Phaser.Math.Clamp(facingVec.dot(enemyDir), -1, 1);
  const angle = Math.acos(dot);

  return Math.abs(angle) <= ATTACK_ARC;
};

export const performPlayerAttack = ({ scene, player, enemies, facing, now }) => {
  let hitCount = 0;

  enemies.children.iterate((enemy) => {
    if (!enemy || !enemy.active) {
      return;
    }

    if (!isEnemyInsideAttackCone(player, enemy, facing)) {
      return;
    }

    const damage = calculateDamage(player.stats, enemy.stats);
    applyDamage(enemy.stats, damage);
    enemy.lastReceivedHitAt = now;

    if (enemy.healthBar) {
      enemy.healthBar.update();
    }

    if (isDead(enemy.stats)) {
      enemy.healthBar?.destroy();
      enemy.destroy();
    }

    hitCount += 1;
  });

  const flash = scene.add.circle(player.x, player.y, ATTACK_RANGE, 0xffd166, 0.2);
  flash.setDepth(8);
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 120,
    onComplete: () => flash.destroy(),
  });

  return hitCount;
};

export const processContactDamage = ({ player, enemy, now, cooldownMs = 700 }) => {
  if (!enemy.active || !player.active) {
    return false;
  }

  if (now - enemy.lastContactDamageAt < cooldownMs) {
    return false;
  }

  enemy.lastContactDamageAt = now;
  const damage = calculateDamage(enemy.stats, player.stats);
  applyDamage(player.stats, damage);
  return true;
};

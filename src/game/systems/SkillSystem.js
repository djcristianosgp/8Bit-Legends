import Phaser from 'phaser';
import { applyDamage, isDead } from '../combat/stats';
import { SKILL_CONFIG } from '../data/skills';
import { showCollectFeedback } from '../items/dropSystem';

const facingToVector = (facing) => {
  const vectors = {
    down: new Phaser.Math.Vector2(0, 1),
    up: new Phaser.Math.Vector2(0, -1),
    left: new Phaser.Math.Vector2(-1, 0),
    right: new Phaser.Math.Vector2(1, 0),
  };

  return vectors[facing] ?? vectors.down;
};

const ensureSkillTexture = (scene, textureKey, color) => {
  if (scene.textures.exists(textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(color, 1);
  graphics.fillCircle(8, 8, 7);
  graphics.lineStyle(2, 0x101725, 1);
  graphics.strokeCircle(8, 8, 7);
  graphics.generateTexture(textureKey, 16, 16);
  graphics.destroy();
};

export class SkillSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.player = null;
    this.enemies = null;
    this.onEnemyDefeated = options.onEnemyDefeated ?? (() => {});
    this.projectiles = null;
    this.keys = {};
    this.cooldowns = {};
    this.activeAura = null;
    this.auraRing = null;
  }

  create(player, enemies) {
    this.player = player;
    this.enemies = enemies;
    this.projectiles = this.scene.physics.add.group({ maxSize: 18 });

    this.keys.fireball = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.keys.lightning = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.keys.aura = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    ensureSkillTexture(this.scene, 'skill-fireball', SKILL_CONFIG.fireball.color);

    this.scene.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectile, enemy) => this.handleProjectileHit(projectile, enemy),
      null,
      this,
    );
  }

  update(time, player, enemies, facing = 'down') {
    this.player = player ?? this.player;
    this.enemies = enemies ?? this.enemies;

    if (!this.player || !this.enemies) {
      return;
    }

    if (this.keys.fireball && Phaser.Input.Keyboard.JustDown(this.keys.fireball)) {
      this.tryCastFireball(time, facing);
    }

    if (this.keys.lightning && Phaser.Input.Keyboard.JustDown(this.keys.lightning)) {
      this.tryCastLightning(time);
    }

    if (this.keys.aura && Phaser.Input.Keyboard.JustDown(this.keys.aura)) {
      this.tryCastAura(time);
    }

    this.projectiles?.children.iterate((projectile) => {
      if (!projectile?.active) {
        return;
      }

      if (time >= (projectile.expireAt ?? 0)) {
        projectile.destroy();
      }
    });

    if (this.activeAura && time >= this.activeAura.endsAt) {
      this.clearAura();
    }

    if (this.auraRing?.active && this.player?.active) {
      this.auraRing.setPosition(this.player.x, this.player.y);
    }
  }

  isOnCooldown(skillKey, time) {
    return (this.cooldowns[skillKey] ?? 0) > time;
  }

  startCooldown(skillKey, time) {
    this.cooldowns[skillKey] = time + (SKILL_CONFIG[skillKey]?.cooldown ?? 0);
  }

  tryCastFireball(time, facing) {
    const config = SKILL_CONFIG.fireball;

    if (this.isOnCooldown(config.key, time) || !this.projectiles) {
      return false;
    }

    const projectile = this.projectiles.create(this.player.x, this.player.y, 'skill-fireball');
    if (!projectile) {
      return false;
    }

    const direction = facingToVector(facing);

    projectile.setDepth(9);
    projectile.setScale(1.1);
    projectile.body.setAllowGravity(false);
    projectile.body.setCircle(6, 2, 2);
    projectile.body.setVelocity(direction.x * config.projectileSpeed, direction.y * config.projectileSpeed);
    projectile.rotation = Math.atan2(direction.y, direction.x);
    projectile.expireAt = time + config.projectileLifetime;
    projectile.damage = this.scene.weaponSystem?.getSkillDamage(config.damage) ?? config.damage;

    const burst = this.scene.add.circle(this.player.x, this.player.y, 14, config.color, 0.25).setDepth(8);
    this.scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 1.8,
      duration: 160,
      onComplete: () => burst.destroy(),
    });

    this.startCooldown(config.key, time);
    return true;
  }

  tryCastLightning(time) {
    const config = SKILL_CONFIG.lightning;

    if (this.isOnCooldown(config.key, time)) {
      return false;
    }

    const target = this.findNearestEnemy(this.player, config.range);
    if (!target) {
      return false;
    }

    const damage = this.scene.weaponSystem?.getSkillDamage(config.damage) ?? config.damage;
    applyDamage(target.stats, damage);
    target.lastReceivedHitAt = time;
    target.healthBar?.update();

    const beam = this.scene.add.graphics().setDepth(9);
    beam.lineStyle(3, config.color, 0.9);
    beam.beginPath();
    beam.moveTo(this.player.x, this.player.y);
    beam.lineTo(target.x, target.y);
    beam.strokePath();

    const spark = this.scene.add.circle(target.x, target.y, 16, config.color, 0.35).setDepth(9);
    this.scene.visualEffects?.spawnImpact(target.x, target.y, config.color, 16);
    this.scene.tweens.add({
      targets: [beam, spark],
      alpha: 0,
      duration: 180,
      onComplete: () => {
        beam.destroy();
        spark.destroy();
      },
    });

    this.startCooldown(config.key, time);

    if (isDead(target.stats)) {
      this.onEnemyDefeated(target);
      target.healthBar?.destroy();
      target.destroy();
    }

    return true;
  }

  tryCastAura(time) {
    const config = SKILL_CONFIG.aura;

    if (this.isOnCooldown(config.key, time) || !this.player?.stats) {
      return false;
    }

    this.clearAura();

    this.player.stats.bonusAttack += config.attackBonus;
    this.player.stats.bonusSpeed += config.speedBonus;
    this.activeAura = {
      endsAt: time + config.duration,
      attackBonus: config.attackBonus,
      speedBonus: config.speedBonus,
    };

    this.auraRing?.destroy();
    this.auraRing = this.scene.add.circle(this.player.x, this.player.y, 24, config.color, 0.16).setDepth(7);
    this.scene.tweens.add({
      targets: this.auraRing,
      scale: 1.2,
      alpha: 0.28,
      duration: 320,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    showCollectFeedback(
      this.scene,
      this.player.x,
      this.player.y - 20,
      `Aura ativa: ATQ +${config.attackBonus} / VEL +${config.speedBonus}`,
      '#d1a8ff',
    );

    this.startCooldown(config.key, time);
    return true;
  }

  clearAura() {
    if (this.activeAura && this.player?.stats) {
      this.player.stats.bonusAttack = Math.max(0, this.player.stats.bonusAttack - this.activeAura.attackBonus);
      this.player.stats.bonusSpeed = Math.max(0, this.player.stats.bonusSpeed - this.activeAura.speedBonus);
    }

    this.activeAura = null;
    this.auraRing?.destroy();
    this.auraRing = null;
  }

  findNearestEnemy(source, maxRange = Infinity) {
    if (!source || !this.enemies?.children) {
      return null;
    }

    let nearest = null;
    let minDistance = maxRange;

    this.enemies.children.iterate((enemy) => {
      if (!enemy?.active || !enemy.stats || isDead(enemy.stats)) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(source.x, source.y, enemy.x, enemy.y);
      if (distance <= minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    });

    return nearest;
  }

  handleProjectileHit(projectile, enemy) {
    if (!projectile?.active || !enemy?.active || !enemy.stats) {
      return false;
    }

    const damage = projectile.damage ?? SKILL_CONFIG.fireball.damage;
    applyDamage(enemy.stats, damage);
    enemy.lastReceivedHitAt = this.scene.time.now;
    enemy.healthBar?.update();

    const flash = this.scene.add.circle(projectile.x, projectile.y, 14, SKILL_CONFIG.fireball.color, 0.35);
    flash.setDepth(9);
    this.scene.visualEffects?.spawnImpact(projectile.x, projectile.y, SKILL_CONFIG.fireball.color, 14);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.8,
      duration: 150,
      onComplete: () => flash.destroy(),
    });

    projectile.destroy();

    if (isDead(enemy.stats)) {
      this.onEnemyDefeated(enemy);
      enemy.healthBar?.destroy();
      enemy.destroy();
    }

    return true;
  }

  getStatusSnapshot(time = this.scene.time.now) {
    const formatCooldown = (skillKey) => {
      const remaining = Math.max(0, (this.cooldowns[skillKey] ?? 0) - time);
      return remaining > 0 ? `${(remaining / 1000).toFixed(1)}s` : 'OK';
    };

    const auraRemaining = this.activeAura ? Math.max(0, Math.ceil((this.activeAura.endsAt - time) / 1000)) : 0;

    return {
      fireball: formatCooldown('fireball'),
      lightning: formatCooldown('lightning'),
      aura: formatCooldown('aura'),
      auraActive: auraRemaining > 0 ? `${auraRemaining}s` : 'OFF',
    };
  }

  getHudLines(time = this.scene.time.now) {
    const status = this.getStatusSnapshot(time);

    return [
      `Skills 1:${status.fireball}  2:${status.lightning}  3:${status.aura}`,
      `Aura ${status.auraActive !== 'OFF' ? `${status.auraActive} ativa` : 'inativa'}`,
    ];
  }

  destroy() {
    this.clearAura();
    this.projectiles?.clear(true, true);
    this.projectiles?.destroy();
  }
}

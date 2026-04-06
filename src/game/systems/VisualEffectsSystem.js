import Phaser from 'phaser';

export class VisualEffectsSystem {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.playerShadow = null;
    this.dayOverlay = null;
    this.vignette = null;
    this.lastDustAt = 0;
    this.lastTrailAt = 0;
    this.reducedEffects = Boolean(scene.registry.get('deviceProfile')?.reducedEffects);
    this.dustInterval = this.reducedEffects ? 210 : 130;
    this.onResize = (gameSize) => this.drawScreenEffects(gameSize.width, gameSize.height);
  }

  create(player) {
    this.player = player;

    this.playerShadow = this.scene.add.ellipse(player.x, player.y + 14, 18, 8, 0x000000, 0.22).setDepth(1.4);
    this.dayOverlay = this.scene.add.rectangle(0, 0, 10, 10, 0xf7f1cf, 0.045)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(24);

    this.vignette = this.scene.add.graphics().setScrollFactor(0).setDepth(25);
    this.drawScreenEffects(this.scene.scale.width, this.scene.scale.height);
    this.scene.scale.on('resize', this.onResize);

    this.scene.tweens.add({
      targets: this.player,
      scaleX: { from: 2, to: 2.04 },
      scaleY: { from: 2, to: 1.98 },
      duration: this.reducedEffects ? 1200 : 760,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  drawScreenEffects(width, height) {
    this.dayOverlay?.setSize(width, height);

    if (!this.vignette) {
      return;
    }

    this.vignette.clear();
    this.vignette.fillStyle(0x07101c, this.reducedEffects ? 0.04 : 0.08);
    this.vignette.fillRect(0, 0, width, height);

    this.vignette.fillStyle(0x02050a, this.reducedEffects ? 0.1 : 0.18);
    this.vignette.fillRect(0, 0, width, 20);
    this.vignette.fillRect(0, height - 24, width, 24);
    this.vignette.fillRect(0, 0, 18, height);
    this.vignette.fillRect(width - 18, 0, 18, height);
  }

  update(time, isMoving = false, facing = 'down') {
    if (!this.player?.active) {
      return;
    }

    const walkPulse = isMoving ? Math.sin(time / 90) * 0.06 : Math.sin(time / 260) * 0.03;
    this.playerShadow?.setPosition(this.player.x, this.player.y + 15);
    this.playerShadow?.setScale(1 + walkPulse, 1 - walkPulse * 0.35);
    this.playerShadow?.setAlpha(isMoving ? 0.18 : 0.23);

    if (isMoving && time - this.lastDustAt >= this.dustInterval) {
      this.lastDustAt = time;
      this.spawnDust(facing);
    }
  }

  spawnDust(facing = 'down') {
    if (!this.player) {
      return;
    }

    const offsetByFacing = {
      down: { x: 0, y: 10 },
      up: { x: 0, y: 9 },
      left: { x: 5, y: 10 },
      right: { x: -5, y: 10 },
    };

    const offset = offsetByFacing[facing] ?? offsetByFacing.down;
    const dust = this.scene.add.circle(
      this.player.x + offset.x,
      this.player.y + offset.y,
      Phaser.Math.Between(2, 3),
      0xe0d3ad,
      0.28,
    ).setDepth(1.45);

    this.scene.tweens.add({
      targets: dust,
      y: dust.y - Phaser.Math.Between(6, 10),
      x: dust.x + Phaser.Math.Between(-4, 4),
      alpha: 0,
      duration: 320,
      onComplete: () => dust.destroy(),
    });
  }

  spawnImpact(x, y, color = 0xffd166, radius = 12) {
    const ring = this.scene.add.circle(x, y, radius, color, 0.28).setDepth(9);
    const spark = this.scene.add.circle(x, y, Math.max(3, radius / 3), 0xffffff, 0.52).setDepth(9);

    this.scene.tweens.add({
      targets: [ring, spark],
      scale: 1.8,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        ring.destroy();
        spark.destroy();
      },
    });
  }

  spawnArrowTrail(x, y) {
    const trail = this.scene.add.circle(x, y, 3, 0xa5d8ff, 0.24).setDepth(0.9);
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.7,
      duration: 180,
      onComplete: () => trail.destroy(),
    });
  }

  destroy() {
    this.scene.scale.off('resize', this.onResize);
    this.playerShadow?.destroy();
    this.dayOverlay?.destroy();
    this.vignette?.destroy();
  }
}

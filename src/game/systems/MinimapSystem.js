import Phaser from 'phaser';

const MAP_W = 124;
const MAP_H = 90;

export class MinimapSystem {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.enemies = null;
    this.worldSize = { width: 1, height: 1 };
    this.graphics = null;
    this.label = null;
    this._handleResize = () => this.layout();
    this.lastDrawAt = 0;
  }

  create({ player, enemies, worldSize }) {
    this.player = player;
    this.enemies = enemies;
    this.worldSize = worldSize;
    this.graphics = this.scene.add.graphics().setScrollFactor(0).setDepth(34);
    this.label = this.scene.add
      .text(0, 0, 'Mini mapa', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '11px',
        color: '#dbe7ff',
        stroke: '#06090f',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(35);

    this.layout();
    this.scene.scale.on('resize', this._handleResize);
  }

  layout() {
    if (!this.label) {
      return;
    }

    this.originX = this.scene.scale.width - MAP_W - 18;
    this.originY = 64;
    this.label.setPosition(this.originX + 4, this.originY - 16);
  }

  update(time) {
    if (!this.graphics || time - this.lastDrawAt < 110) {
      return;
    }

    this.lastDrawAt = time;
    const scaleX = (MAP_W - 12) / Math.max(1, this.worldSize.width);
    const scaleY = (MAP_H - 12) / Math.max(1, this.worldSize.height);

    this.graphics.clear();
    this.graphics.fillStyle(0x07101c, 0.68);
    this.graphics.fillRoundedRect(this.originX, this.originY, MAP_W, MAP_H, 8);
    this.graphics.lineStyle(2, 0x5d7aa5, 1);
    this.graphics.strokeRoundedRect(this.originX, this.originY, MAP_W, MAP_H, 8);

    this.graphics.fillStyle(0x15304a, 0.4);
    this.graphics.fillRect(this.originX + 6, this.originY + 6, MAP_W - 12, MAP_H - 12);

    this.enemies?.children?.iterate((enemy) => {
      if (!enemy?.active) {
        return;
      }

      const px = this.originX + 6 + enemy.x * scaleX;
      const py = this.originY + 6 + enemy.y * scaleY;
      this.graphics.fillStyle(enemy.isBoss ? 0xff8a5c : 0xff6f6f, 0.95);
      this.graphics.fillCircle(px, py, enemy.isBoss ? 3 : 2);
    });

    if (this.player?.active) {
      const playerX = this.originX + 6 + this.player.x * scaleX;
      const playerY = this.originY + 6 + this.player.y * scaleY;
      this.graphics.fillStyle(0x8ef2a7, 1);
      this.graphics.fillCircle(playerX, playerY, 3);
      this.graphics.lineStyle(1, 0xffffff, 0.9);
      this.graphics.strokeCircle(playerX, playerY, 4.5);
    }
  }

  destroy() {
    this.scene.scale.off('resize', this._handleResize);
    this.graphics?.destroy();
    this.label?.destroy();
  }
}

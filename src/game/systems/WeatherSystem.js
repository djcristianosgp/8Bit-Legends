import Phaser from 'phaser';

const WEATHER_BY_PHASE = {
  1: 'day',
  2: 'day',
  3: 'rain',
  4: 'rain',
  5: 'day',
  6: 'night',
  7: 'night',
  8: 'rain',
  9: 'night',
  10: 'night',
};

const WEATHER_LABELS = {
  day: 'Dia',
  rain: 'Chuva',
  night: 'Noite',
};

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.weatherType = 'day';
    this.overlay = null;
    this.rainGraphics = null;
    this.raindrops = [];
    this.reducedEffects = Boolean(scene.registry.get('deviceProfile')?.reducedEffects);
    this.rainDrawIntervalMs = this.reducedEffects ? 66 : 40;
    this.lastRainDrawAt = 0;
    this.rainStepSeconds = 0;
    this._handleResize = (gameSize) => this.layout(gameSize.width, gameSize.height);
  }

  create({ phase = 1 }) {
    this.weatherType = WEATHER_BY_PHASE[phase] ?? 'day';

    this.overlay = this.scene.add
      .rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x0d1627, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(22);

    this.rainGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(22.5);
    this.layout(this.scene.scale.width, this.scene.scale.height);
    this.createRaindrops();
    this.applyWeather();
    this.scene.scale.on('resize', this._handleResize);
  }

  createRaindrops() {
    const dropCount = this.reducedEffects ? 32 : 68;
    this.raindrops = Array.from({ length: dropCount }, () => ({
      x: Phaser.Math.Between(0, this.scene.scale.width),
      y: Phaser.Math.Between(0, this.scene.scale.height),
      speed: Phaser.Math.Between(240, 420),
      length: Phaser.Math.Between(8, 13),
    }));
  }

  applyWeather() {
    if (!this.overlay) {
      return;
    }

    if (this.weatherType === 'night') {
      this.overlay.setFillStyle(0x07101d, 0.22);
    } else if (this.weatherType === 'rain') {
      this.overlay.setFillStyle(0x0b1320, 0.12);
    } else {
      this.overlay.setFillStyle(0xf2e7bf, 0.04);
    }
  }

  update(time) {
    if (!this.overlay) {
      return;
    }

    if (this.weatherType === 'night') {
      this.overlay.setAlpha(0.2 + Math.sin(time / 1800) * 0.015);
    }

    if (this.weatherType !== 'rain' || !this.rainGraphics) {
      this.rainGraphics?.clear();
      return;
    }

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    if (time - this.lastRainDrawAt < this.rainDrawIntervalMs) {
      return;
    }

    const deltaMs = this.lastRainDrawAt > 0 ? time - this.lastRainDrawAt : this.rainDrawIntervalMs;
    this.lastRainDrawAt = time;
    this.rainStepSeconds = Math.min(0.08, deltaMs / 1000);

    this.rainGraphics.clear();
    this.rainGraphics.lineStyle(1, 0x9fdcff, this.reducedEffects ? 0.22 : 0.35);

    this.raindrops.forEach((drop) => {
      drop.y += drop.speed * this.rainStepSeconds;
      drop.x -= drop.speed * this.rainStepSeconds * 0.3125;

      if (drop.y > height + 16 || drop.x < -16) {
        drop.x = Phaser.Math.Between(0, width + 20);
        drop.y = Phaser.Math.Between(-40, -10);
      }

      this.rainGraphics.beginPath();
      this.rainGraphics.moveTo(drop.x, drop.y);
      this.rainGraphics.lineTo(drop.x - 3, drop.y + drop.length);
      this.rainGraphics.strokePath();
    });
  }

  getWeatherType() {
    return this.weatherType;
  }

  getLabel() {
    return WEATHER_LABELS[this.weatherType] ?? 'Dia';
  }

  layout(width, height) {
    this.overlay?.setSize(width, height);
  }

  destroy() {
    this.scene.scale.off('resize', this._handleResize);
    this.overlay?.destroy();
    this.rainGraphics?.destroy();
  }
}

import Phaser from 'phaser';
import { getBiomeConfig } from '../maps/biomeConfig';

const biomePaletteByName = {
  starter_field: {
    tree: 0x5d9d4b,
    bush: 0x73b45f,
    flower: 0xf0d98a,
    stone: 0x8b8f98,
    critterA: 0xf4efe1,
    critterB: 0x8ed0ff,
    critterC: 0xffc6d8,
  },
  forest: {
    tree: 0x356d3f,
    bush: 0x4f9b59,
    flower: 0xc98cff,
    stone: 0x6f7b76,
    critterA: 0xf3f0e6,
    critterB: 0xb7ecff,
    critterC: 0xffd974,
  },
  ruins: {
    tree: 0x7b7d62,
    bush: 0x98a870,
    flower: 0xcaa8ff,
    stone: 0xa2a0a0,
    critterA: 0xf6ead9,
    critterB: 0xb0c7ff,
    critterC: 0xffb87d,
  },
  volcano: {
    tree: 0x91523a,
    bush: 0xc1703d,
    flower: 0xffd166,
    stone: 0x5b4745,
    critterA: 0xe8d8cf,
    critterB: 0xffb199,
    critterC: 0xffed8a,
  },
  crystal: {
    tree: 0x58a7b6,
    bush: 0x77d4e0,
    flower: 0xd1b2ff,
    stone: 0x8ca4b9,
    critterA: 0xecfbff,
    critterB: 0x9fe4ff,
    critterC: 0xf5d7ff,
  },
};

const seededRandom = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let value = Math.imul(t ^ (t >>> 15), 1 | t);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export class AmbienceSystem {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.worldSize = { width: 0, height: 0 };
    this.decor = [];
    this.critters = [];
    this.lastUpdateAt = 0;
  }

  create({ player, worldSize, phase = 1 }) {
    this.player = player;
    this.worldSize = worldSize;

    const biomeName = getBiomeConfig(phase)?.name ?? 'starter_field';
    const palette = biomePaletteByName[biomeName] ?? biomePaletteByName.starter_field;
    const rand = seededRandom(phase * 9871 + Math.floor(worldSize.width));

    this.createDecorations(rand, palette);
    this.createCritters(rand, palette);
  }

  createDecorations(rand, palette) {
    const { width, height } = this.worldSize;
    const padding = 42;

    const randomPosition = (spreadPadding = padding) => ({
      x: spreadPadding + rand() * Math.max(24, width - spreadPadding * 2),
      y: spreadPadding + rand() * Math.max(24, height - spreadPadding * 2),
    });

    for (let i = 0; i < 7; i += 1) {
      const pos = randomPosition();
      if (Phaser.Math.Distance.Between(pos.x, pos.y, this.player.x, this.player.y) < 70) {
        continue;
      }
      this.decor.push(this.createTree(pos.x, pos.y, palette, 0.85 + rand() * 0.5));
    }

    for (let i = 0; i < 10; i += 1) {
      const pos = randomPosition(28);
      this.decor.push(this.createBush(pos.x, pos.y, palette, 0.75 + rand() * 0.4));
    }

    for (let i = 0; i < 12; i += 1) {
      const pos = randomPosition(20);
      this.decor.push(this.createFlower(pos.x, pos.y, palette, 0.8 + rand() * 0.3));
    }

    for (let i = 0; i < 7; i += 1) {
      const pos = randomPosition(18);
      this.decor.push(this.createStone(pos.x, pos.y, palette, 0.7 + rand() * 0.35));
    }
  }

  createTree(x, y, palette, scale = 1) {
    const shadow = this.scene.add.ellipse(x + 2, y + 10, 28 * scale, 12 * scale, 0x000000, 0.18).setDepth(0.6);
    const trunk = this.scene.add.rectangle(x, y + 2, 6 * scale, 14 * scale, 0x6f4c2d).setDepth(1.55);
    const leavesBack = this.scene.add.ellipse(x - 4, y - 8, 20 * scale, 16 * scale, palette.tree, 0.96).setDepth(1.5);
    const leavesFront = this.scene.add.ellipse(x + 5, y - 7, 22 * scale, 18 * scale, palette.bush, 0.98).setDepth(1.6);

    this.scene.tweens.add({
      targets: [leavesBack, leavesFront],
      angle: { from: -2.5, to: 2.5 },
      x: { from: x - 1.5, to: x + 1.5 },
      duration: 1700 + scale * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return { destroy: () => [shadow, trunk, leavesBack, leavesFront].forEach((node) => node.destroy()) };
  }

  createBush(x, y, palette, scale = 1) {
    const shadow = this.scene.add.ellipse(x, y + 5, 18 * scale, 8 * scale, 0x000000, 0.12).setDepth(0.5);
    const bush = this.scene.add.ellipse(x, y, 16 * scale, 12 * scale, palette.bush, 0.95).setDepth(1.3);
    bush.setStrokeStyle(1, 0x20331f, 0.9);
    return { destroy: () => { shadow.destroy(); bush.destroy(); } };
  }

  createFlower(x, y, palette, scale = 1) {
    const stem = this.scene.add.rectangle(x, y + 3, 2, 7 * scale, 0x4f7d43, 1).setDepth(1.15);
    const bloom = this.scene.add.circle(x, y, 3.5 * scale, palette.flower, 0.95).setDepth(1.2);
    return { destroy: () => { stem.destroy(); bloom.destroy(); } };
  }

  createStone(x, y, palette, scale = 1) {
    const stone = this.scene.add.ellipse(x, y, 12 * scale, 8 * scale, palette.stone, 0.9).setDepth(1.1);
    stone.setStrokeStyle(1, 0x2b313d, 0.7);
    return { destroy: () => stone.destroy() };
  }

  createCritters(rand, palette) {
    const critterTypes = ['rabbit', 'bird', 'butterfly'];

    for (let i = 0; i < 6; i += 1) {
      const x = 44 + rand() * Math.max(30, this.worldSize.width - 88);
      const y = 44 + rand() * Math.max(30, this.worldSize.height - 88);
      const type = critterTypes[i % critterTypes.length];
      const tint = [palette.critterA, palette.critterB, palette.critterC][i % 3];
      this.critters.push(this.createCritter(type, x, y, tint, rand));
    }
  }

  createCritter(type, x, y, tint, rand) {
    const shadow = this.scene.add.ellipse(x, y + 6, 10, 4, 0x000000, 0.15).setDepth(1.6);

    const body =
      type === 'rabbit'
        ? this.scene.add.ellipse(x, y, 10, 8, tint, 0.96)
        : type === 'bird'
          ? this.scene.add.ellipse(x, y, 9, 7, tint, 0.96)
          : this.scene.add.ellipse(x, y, 7, 6, tint, 0.9);
    body.setDepth(1.8);

    const accent =
      type === 'butterfly'
        ? this.scene.add.ellipse(x + 4, y - 1, 6, 5, 0xfff3c1, 0.7).setDepth(1.81)
        : this.scene.add.circle(x + 2, y - 1, 1.6, 0x1c2431, 0.95).setDepth(1.81);

    return {
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      speed: type === 'butterfly' ? 22 : 15,
      bob: rand() * Math.PI * 2,
      nextDecisionAt: 0,
      shadow,
      body,
      accent,
      destroy: () => {
        shadow.destroy();
        body.destroy();
        accent.destroy();
      },
    };
  }

  update(time) {
    if (!this.player || time - this.lastUpdateAt < 60) {
      return;
    }

    this.lastUpdateAt = time;

    this.critters.forEach((critter) => {
      if (!critter?.body?.active) {
        return;
      }

      const distanceToPlayer = Phaser.Math.Distance.Between(critter.x, critter.y, this.player.x, this.player.y);

      if (distanceToPlayer < 78) {
        const fleeAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, critter.x, critter.y);
        critter.vx = Math.cos(fleeAngle) * (critter.speed + 18);
        critter.vy = Math.sin(fleeAngle) * (critter.speed + 18);
        critter.nextDecisionAt = time + 320;
      } else if (time >= critter.nextDecisionAt) {
        const angle = randAngle(time, critter.bob);
        const speedFactor = Phaser.Math.FloatBetween(0.35, 1);
        critter.vx = Math.cos(angle) * critter.speed * speedFactor;
        critter.vy = Math.sin(angle) * critter.speed * speedFactor;
        critter.nextDecisionAt = time + Phaser.Math.Between(500, 1400);
      }

      critter.x = clamp(critter.x + critter.vx * 0.06, 24, this.worldSize.width - 24);
      critter.y = clamp(critter.y + critter.vy * 0.06, 24, this.worldSize.height - 24);

      const bobOffset = Math.sin(time / (critter.type === 'butterfly' ? 120 : 180) + critter.bob) * (critter.type === 'butterfly' ? 2.5 : 1.2);

      critter.shadow.setPosition(critter.x, critter.y + 6);
      critter.body.setPosition(critter.x, critter.y + bobOffset);
      critter.accent.setPosition(critter.x + 3, critter.y + bobOffset - 1);
      critter.body.setScale(critter.vx < 0 ? -1 : 1, 1);
    });
  }

  destroy() {
    this.decor.forEach((entry) => entry?.destroy?.());
    this.critters.forEach((entry) => entry?.destroy?.());
    this.decor = [];
    this.critters = [];
  }
}

const randAngle = (time, offset) => (time / 500 + offset * 1000) % (Math.PI * 2);

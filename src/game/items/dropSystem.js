import { ITEM_CONFIG } from './itemDefinitions';

const DRAW_SIZE = 16;

const ensureItemTexture = (scene, textureKey, color) => {
  if (scene.textures.exists(textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(color, 1);
  graphics.fillCircle(DRAW_SIZE / 2, DRAW_SIZE / 2, 6);
  graphics.lineStyle(2, 0x1b1f2d, 1);
  graphics.strokeCircle(DRAW_SIZE / 2, DRAW_SIZE / 2, 6);
  graphics.generateTexture(textureKey, DRAW_SIZE, DRAW_SIZE);
  graphics.destroy();
};

export const createDropGroup = (scene) => scene.physics.add.group();

export const spawnItemDrop = (scene, group, itemType, x, y) => {
  const config = ITEM_CONFIG[itemType];

  if (!config) {
    return null;
  }

  ensureItemTexture(scene, config.textureKey, config.color);

  const drop = scene.physics.add.sprite(x, y, config.textureKey);
  drop.itemType = itemType;
  drop.setDepth(5);
  drop.setScale(1.3);
  drop.body.setAllowGravity(false);
  drop.body.setImmovable(true);

  scene.tweens.add({
    targets: drop,
    y: y - 5,
    duration: 550,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.InOut',
  });

  group.add(drop);
  return drop;
};

export const showCollectFeedback = (scene, x, y, text, color = '#f8f3e6') => {
  const label = scene.add
    .text(x, y - 20, text, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color,
      stroke: '#1f1f2b',
      strokeThickness: 3,
    })
    .setDepth(20)
    .setOrigin(0.5);

  scene.tweens.add({
    targets: label,
    y: y - 44,
    alpha: 0,
    duration: 550,
    onComplete: () => label.destroy(),
  });

  const spark = scene.add.circle(x, y, 8, 0xfff4aa, 0.35).setDepth(19);
  scene.tweens.add({
    targets: spark,
    scale: 2,
    alpha: 0,
    duration: 240,
    onComplete: () => spark.destroy(),
  });
};

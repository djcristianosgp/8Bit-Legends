import { ITEM_CONFIG } from './itemDefinitions';

const DRAW_SIZE = 16;

const normalizeDropData = (dropLike) => {
  if (typeof dropLike === 'string') {
    const config = ITEM_CONFIG[dropLike];
    if (!config) {
      return null;
    }

    return {
      kind: 'item',
      itemType: dropLike,
      label: config.label,
      color: config.color,
      textColor: '#f8f3e6',
      textureKey: config.textureKey,
      shape: 'orb',
      rarity: 'common',
    };
  }

  if (!dropLike || typeof dropLike !== 'object') {
    return null;
  }

  const fallbackConfig = ITEM_CONFIG[dropLike.itemType];

  return {
    kind: dropLike.kind ?? 'item',
    itemType: dropLike.itemType ?? null,
    weaponId: dropLike.weaponId ?? null,
    label: dropLike.label ?? fallbackConfig?.label ?? 'Loot',
    color: dropLike.color ?? fallbackConfig?.color ?? 0xf8f3e6,
    textColor: dropLike.textColor ?? '#f8f3e6',
    textureKey:
      dropLike.textureKey ?? fallbackConfig?.textureKey ?? `item-drop-${dropLike.itemType ?? 'loot'}`,
    shape: dropLike.shape ?? 'orb',
    rarity: dropLike.rarity ?? 'common',
  };
};

const ensureItemTexture = (scene, textureKey, color, shape = 'orb') => {
  if (scene.textures.exists(textureKey)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(color, 1);
  graphics.lineStyle(2, 0x1b1f2d, 1);

  if (shape === 'square') {
    graphics.fillRoundedRect(2, 2, DRAW_SIZE - 4, DRAW_SIZE - 4, 3);
    graphics.strokeRoundedRect(2, 2, DRAW_SIZE - 4, DRAW_SIZE - 4, 3);
  } else {
    graphics.fillCircle(DRAW_SIZE / 2, DRAW_SIZE / 2, 6);
    graphics.strokeCircle(DRAW_SIZE / 2, DRAW_SIZE / 2, 6);
  }

  graphics.generateTexture(textureKey, DRAW_SIZE, DRAW_SIZE);
  graphics.destroy();
};

export const createDropGroup = (scene) => scene.physics.add.group();

export const spawnItemDrop = (scene, group, dropLike, x, y) => {
  const dropData = normalizeDropData(dropLike);

  if (!dropData) {
    return null;
  }

  ensureItemTexture(scene, dropData.textureKey, dropData.color, dropData.shape);

  const drop = scene.physics.add.sprite(x, y, dropData.textureKey);
  drop.itemType = dropData.itemType;
  drop.dropData = dropData;
  drop.setDepth(5);
  drop.setScale(dropData.shape === 'square' ? 1.15 : 1.3);
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

  showCollectFeedback(scene, x, y - 6, dropData.label, dropData.textColor);
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

export const ITEM_TYPES = {
  HEALTH: 'health',
  STRENGTH: 'strength',
  SPEED: 'speed',
};

export const ITEM_CONFIG = {
  [ITEM_TYPES.HEALTH]: {
    label: 'Vida',
    color: 0x6de38f,
    weight: 45,
    textureKey: 'item-health',
  },
  [ITEM_TYPES.STRENGTH]: {
    label: 'Forca',
    color: 0xff8b6b,
    weight: 30,
    textureKey: 'item-strength',
  },
  [ITEM_TYPES.SPEED]: {
    label: 'Velocidade',
    color: 0x5ab8ff,
    weight: 25,
    textureKey: 'item-speed',
  },
};

export const DROP_CHANCE = 0.55;

const weightedPool = Object.entries(ITEM_CONFIG).flatMap(([itemType, cfg]) =>
  Array.from({ length: cfg.weight }, () => itemType),
);

export const rollEnemyDrop = () => {
  if (Math.random() > DROP_CHANCE) {
    return null;
  }

  const index = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[index];
};

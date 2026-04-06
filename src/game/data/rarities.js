export const RARITY_TYPES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const RARITY_CONFIG = {
  [RARITY_TYPES.COMMON]: {
    id: RARITY_TYPES.COMMON,
    label: 'Common',
    color: 0xf8f3e6,
    textColor: '#f8f3e6',
    multiplier: 1,
    weight: 58,
    bossWeight: 28,
  },
  [RARITY_TYPES.RARE]: {
    id: RARITY_TYPES.RARE,
    label: 'Rare',
    color: 0x67b7ff,
    textColor: '#67b7ff',
    multiplier: 1.2,
    weight: 26,
    bossWeight: 34,
  },
  [RARITY_TYPES.EPIC]: {
    id: RARITY_TYPES.EPIC,
    label: 'Epic',
    color: 0xc07cff,
    textColor: '#c07cff',
    multiplier: 1.5,
    weight: 12,
    bossWeight: 24,
  },
  [RARITY_TYPES.LEGENDARY]: {
    id: RARITY_TYPES.LEGENDARY,
    label: 'Legendary',
    color: 0xffa24d,
    textColor: '#ffb067',
    multiplier: 2,
    weight: 4,
    bossWeight: 14,
  },
};

const pickWeightedEntry = (entries, weightKey) => {
  const total = entries.reduce((sum, [, cfg]) => sum + (cfg[weightKey] ?? 0), 0);
  let roll = Math.random() * Math.max(1, total);

  for (const [id, cfg] of entries) {
    roll -= cfg[weightKey] ?? 0;
    if (roll <= 0) {
      return id;
    }
  }

  return entries[0]?.[0] ?? RARITY_TYPES.COMMON;
};

export const getRarityConfig = (rarity = RARITY_TYPES.COMMON) =>
  RARITY_CONFIG[rarity] ?? RARITY_CONFIG[RARITY_TYPES.COMMON];

export const getRarityMultiplier = (rarity = RARITY_TYPES.COMMON) =>
  getRarityConfig(rarity).multiplier;

export const rollRarity = (isBoss = false) => {
  const weightKey = isBoss ? 'bossWeight' : 'weight';
  return pickWeightedEntry(Object.entries(RARITY_CONFIG), weightKey);
};

import { getRarityConfig, rollRarity } from '../data/rarities';
import { getWeaponConfig, rollWeaponType } from '../data/weapons';
import { ITEM_CONFIG } from '../items/itemDefinitions';

const rollConsumableType = () => {
  const pool = Object.entries(ITEM_CONFIG);
  const total = pool.reduce((sum, [, config]) => sum + config.weight, 0);
  let roll = Math.random() * Math.max(1, total);

  for (const [itemType, config] of pool) {
    roll -= config.weight;
    if (roll <= 0) {
      return itemType;
    }
  }

  return pool[0]?.[0] ?? null;
};

export class LootSystem {
  constructor(scene) {
    this.scene = scene;
  }

  rollDrop(enemy) {
    const isBoss = Boolean(enemy?.isBoss);
    const dropChance = isBoss ? 0.95 : 0.6;

    if (Math.random() > dropChance) {
      return null;
    }

    const rarity = rollRarity(isBoss);
    const rarityConfig = getRarityConfig(rarity);
    const shouldDropWeapon = isBoss ? Math.random() < 0.52 : Math.random() < 0.22;

    if (shouldDropWeapon) {
      const weaponId = rollWeaponType();
      const weapon = getWeaponConfig(weaponId);

      return {
        kind: 'weapon',
        weaponId,
        rarity,
        label: `${rarityConfig.label} ${weapon.name}`,
        color: weapon.color ?? rarityConfig.color,
        textColor: rarityConfig.textColor,
        textureKey: `drop-weapon-${weaponId}-${rarity}`,
        shape: 'square',
      };
    }

    const itemType = rollConsumableType();
    const itemConfig = ITEM_CONFIG[itemType];

    if (!itemConfig) {
      return null;
    }

    return {
      kind: 'item',
      itemType,
      rarity,
      label: `${rarityConfig.label} ${itemConfig.label}`,
      color: rarityConfig.color,
      textColor: rarityConfig.textColor,
      textureKey: `drop-${itemType}-${rarity}`,
      shape: 'orb',
    };
  }
}

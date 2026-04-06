import { getRarityMultiplier } from '../data/rarities';
import { ITEM_TYPES } from './itemDefinitions';
import { heal } from '../combat/stats';

const HEALTH_HEAL_AMOUNT = 30;
const STRENGTH_BONUS = 2;
const SPEED_BONUS = 12;

const scaleAmount = (amount, rarity = 'common') =>
  Math.max(1, Math.round(amount * getRarityMultiplier(rarity)));

export const applyItemEffect = ({ player, itemType, rarity = 'common' }) => {
  if (!player?.stats) {
    return '';
  }

  switch (itemType) {
    case ITEM_TYPES.HEALTH: {
      const before = player.stats.health;
      heal(player.stats, scaleAmount(HEALTH_HEAL_AMOUNT, rarity));
      const healed = player.stats.health - before;
      return healed > 0 ? `+${healed} HP` : 'HP cheio';
    }
    case ITEM_TYPES.STRENGTH: {
      const bonus = scaleAmount(STRENGTH_BONUS, rarity);
      player.stats.bonusAttack += bonus;
      return `ATQ +${bonus}`;
    }
    case ITEM_TYPES.SPEED: {
      const bonus = scaleAmount(SPEED_BONUS, rarity);
      player.stats.bonusSpeed += bonus;
      return `VEL +${bonus}`;
    }
    default:
      return '';
  }
};

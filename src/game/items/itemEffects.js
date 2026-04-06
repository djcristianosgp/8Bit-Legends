import { ITEM_TYPES } from './itemDefinitions';
import { heal } from '../combat/stats';

const HEALTH_HEAL_AMOUNT = 30;
const STRENGTH_BONUS = 2;
const SPEED_BONUS = 12;

export const applyItemEffect = ({ player, itemType }) => {
  if (!player?.stats) {
    return '';
  }

  switch (itemType) {
    case ITEM_TYPES.HEALTH: {
      const before = player.stats.health;
      heal(player.stats, HEALTH_HEAL_AMOUNT);
      const healed = player.stats.health - before;
      return healed > 0 ? `+${healed} HP` : 'HP cheio';
    }
    case ITEM_TYPES.STRENGTH:
      player.stats.bonusAttack += STRENGTH_BONUS;
      return `ATQ +${STRENGTH_BONUS}`;
    case ITEM_TYPES.SPEED:
      player.stats.bonusSpeed += SPEED_BONUS;
      return `VEL +${SPEED_BONUS}`;
    default:
      return '';
  }
};

import { ITEM_TYPES } from './itemDefinitions';

export const createInventory = () => ({
  [ITEM_TYPES.HEALTH]: 0,
  [ITEM_TYPES.STRENGTH]: 0,
  [ITEM_TYPES.SPEED]: 0,
});

export const addItemToInventory = (inventory, itemType) => {
  inventory[itemType] = (inventory[itemType] ?? 0) + 1;
  return inventory[itemType];
};

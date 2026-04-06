export const SAVE_VERSION = 1;
export const STORAGE_KEY = '8bitlegends_save';

const VALID_FACINGS = new Set(['down', 'up', 'left', 'right']);

export const isValidSave = (data) => {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  if (data.version !== SAVE_VERSION) {
    return false;
  }
  if (typeof data.mapId !== 'string' || data.mapId.length === 0) {
    return false;
  }
  if (data.player === null || typeof data.player !== 'object') {
    return false;
  }
  if (data.player.stats === null || typeof data.player.stats !== 'object') {
    return false;
  }
  if (!VALID_FACINGS.has(data.player.facing)) {
    return false;
  }
  if (data.inventory === null || typeof data.inventory !== 'object') {
    return false;
  }
  return true;
};

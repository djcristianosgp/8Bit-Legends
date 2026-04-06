import { createStarterFieldMap } from './definitions/starterFieldMap';

const mapFactories = {
  'starter-field': createStarterFieldMap,
};

export const getMapById = (mapId) => {
  const factory = mapFactories[mapId];

  if (!factory) {
    throw new Error(`Mapa nao encontrado: ${mapId}`);
  }

  return factory();
};

export const DEFAULT_MAP_ID = 'starter-field';

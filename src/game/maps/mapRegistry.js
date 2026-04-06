import { createStarterFieldMap } from './definitions/starterFieldMap';
import { generatePhaseMap } from './definitions/generatePhaseMap';
import { TOTAL_PHASES } from '../phases/phaseConfig';

const mapFactories = {
  'starter-field': createStarterFieldMap,
};

// Registra as 10 fases dinamicamente
for (let i = 1; i <= TOTAL_PHASES; i++) {
  const phase = i;
  mapFactories[`phase-${phase}`] = () => generatePhaseMap(phase);
}

export const getMapById = (mapId) => {
  const factory = mapFactories[mapId];

  if (!factory) {
    throw new Error(`Mapa nao encontrado: ${mapId}`);
  }

  return factory();
};

export const DEFAULT_MAP_ID = 'phase-1';

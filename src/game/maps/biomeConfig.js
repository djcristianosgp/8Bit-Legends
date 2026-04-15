/**
 * Configuração de biomas por fase
 * Define qual tileset usar em cada fase do jogo
 */

export const BIOME_CONFIG = {
  // Fases 1-2: Campo inicial (tileset padrão)
  1: { key: 'rpg_tileset', imageKey: 'tiles-rpg', name: 'starter_field' },
  2: { key: 'rpg_tileset', imageKey: 'tiles-rpg', name: 'starter_field' },

  // Fases 3-4: Floresta
  3: { key: 'forest_tileset', imageKey: 'tiles-forest', name: 'forest' },
  4: { key: 'forest_tileset', imageKey: 'tiles-forest', name: 'forest' },

  // Fases 5-6: Ruínas
  5: { key: 'ruins_tileset', imageKey: 'tiles-ruins', name: 'ruins' },
  6: { key: 'ruins_tileset', imageKey: 'tiles-ruins', name: 'ruins' },

  // Fases 7-8: Vulcão
  7: { key: 'volcano_tileset', imageKey: 'tiles-volcano', name: 'volcano' },
  8: { key: 'volcano_tileset', imageKey: 'tiles-volcano', name: 'volcano' },

  // Fases 9-10: Caverna Cristalina (final do bloco 1)
  9: { key: 'crystal_tileset', imageKey: 'tiles-crystal', name: 'crystal' },
  10: { key: 'crystal_tileset', imageKey: 'tiles-crystal', name: 'crystal' },

  // ─── Bloco 11-15: Expansão 2 ─────────────────────────────────────────────
  // Fases 11-12: Deserto (novo bioma)
  11: { key: 'desert_tileset', imageKey: 'tiles-desert', name: 'desert' },
  12: { key: 'desert_tileset', imageKey: 'tiles-desert', name: 'desert' },

  // Fases 13-14: Masmorra (novo bioma)
  13: { key: 'dungeon_tileset', imageKey: 'tiles-dungeon', name: 'dungeon' },
  14: { key: 'dungeon_tileset', imageKey: 'tiles-dungeon', name: 'dungeon' },

  // Fase 15: Trono do Abismo (clímax)
  15: { key: 'abyss_tileset', imageKey: 'tiles-abyss', name: 'abyss' },
};

/**
 * Retorna a configuração de bioma para uma fase específica
 */
export const getBiomeConfig = (phase) => {
  const config = BIOME_CONFIG[phase];
  return config || BIOME_CONFIG[1]; // Fallback para fase 1
};

/**
 * Retorna a cor temática do bioma (para HUD/feedback)
 */
export const getBiomeThemeColor = (phase) => {
  const colors = {
    starter_field: '#f4c25b', // Ouro
    forest: '#5ba84b', // Verde
    ruins: '#9b9b9b', // Cinza
    volcano: '#e67e22', // Laranja
    crystal: '#00b4d8', // Azul cristal
    desert: '#d4a574', // Bege deserto
    dungeon: '#4a3f35', // Marrom escuro
    abyss: '#1a0033', // Roxo muito escuro
  };

  const biome = BIOME_CONFIG[phase]?.name || 'starter_field';
  return colors[biome] || colors.starter_field;
};

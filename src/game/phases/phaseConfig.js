export const TOTAL_PHASES = 15;

/**
 * Configuração de cada fase: mapa, quantidade de inimigos e se é fase de boss.
 * Boss aparece a cada 2 fases (fases pares: 2, 4, 6, 8, 10, 12, 14).
 * Fases 11-15: Bloco Deserto + Masmorra + Abismo (expansão 2)
 */
export const PHASE_LIST = [
  { phase: 1,  mapId: 'phase-1',  enemyCount: 3, isBoss: false },
  { phase: 2,  mapId: 'phase-2',  enemyCount: 2, isBoss: true  },
  { phase: 3,  mapId: 'phase-3',  enemyCount: 5, isBoss: false },
  { phase: 4,  mapId: 'phase-4',  enemyCount: 3, isBoss: true  },
  { phase: 5,  mapId: 'phase-5',  enemyCount: 6, isBoss: false },
  { phase: 6,  mapId: 'phase-6',  enemyCount: 4, isBoss: true  },
  { phase: 7,  mapId: 'phase-7',  enemyCount: 7, isBoss: false },
  { phase: 8,  mapId: 'phase-8',  enemyCount: 5, isBoss: true  },
  { phase: 9,  mapId: 'phase-9',  enemyCount: 8, isBoss: false },
  { phase: 10, mapId: 'phase-10', enemyCount: 6, isBoss: true  },
  // ─── Bloco 11-15: Deserto → Masmorra → Trono do Abismo ───────────────────
  { phase: 11, mapId: 'phase-11', enemyCount: 7, isBoss: false },
  { phase: 12, mapId: 'phase-12', enemyCount: 5, isBoss: true  },
  { phase: 13, mapId: 'phase-13', enemyCount: 9, isBoss: false },
  { phase: 14, mapId: 'phase-14', enemyCount: 6, isBoss: true  },
  { phase: 15, mapId: 'phase-15', enemyCount: 7, isBoss: true  }, // Clímax
];

/**
 * Retorna a configuração da fase. Limita ao intervalo válido.
 */
export const getPhaseConfig = (phase) => {
  const idx = Math.min(Math.max(phase - 1, 0), TOTAL_PHASES - 1);
  return PHASE_LIST[idx];
};

/**
 * Fator de dificuldade multiplicativo: cresce 22% por fase.
 * Fase 1 → 1.00 · Fase 5 → 1.88 · Fase 10 → 2.98 · Fase 15 → 4.08
 */
export const getDifficultyFactor = (phase) => 1 + (phase - 1) * 0.22;

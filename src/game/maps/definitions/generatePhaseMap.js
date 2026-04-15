import { TILE_INDEX } from '../mapConstants';

const W = 48;
const H = 30;

const create2D = (w, h, fill) =>
  Array.from({ length: h }, () => Array(w).fill(fill));

const fillH = (walls, row, x1, x2) => {
  for (let x = x1; x <= x2; x++) walls[row][x] = TILE_INDEX.WALL;
};

const fillV = (walls, col, y1, y2) => {
  for (let y = y1; y <= y2; y++) walls[y][col] = TILE_INDEX.WALL;
};

const addBorder = (walls) => {
  for (let x = 0; x < W; x++) {
    walls[0][x] = TILE_INDEX.WALL;
    walls[H - 1][x] = TILE_INDEX.WALL;
  }
  for (let y = 0; y < H; y++) {
    walls[y][0] = TILE_INDEX.WALL;
    walls[y][W - 1] = TILE_INDEX.WALL;
  }
};

// ─── 4 variantes de campo aberto (fases 1, 5, 9, 11) ────────────────────────

const FIELD_LAYOUTS = [
  (walls) => {
    // Campo A – fase 1
    addBorder(walls);
    fillH(walls, 7, 6, 16);
    fillV(walls, 22, 4, 13);
    fillH(walls, 18, 26, 38);
    fillV(walls, 10, 16, 24);
    fillH(walls, 24, 34, 44);
  },
  (walls) => {
    // Campo B – fase 5
    addBorder(walls);
    fillH(walls, 5, 8, 20);
    fillV(walls, 30, 2, 12);
    fillH(walls, 14, 12, 26);
    fillV(walls, 15, 17, 27);
    fillH(walls, 22, 3, 14);
    fillV(walls, 38, 6, 20);
  },
  (walls) => {
    // Campo C – fase 9
    addBorder(walls);
    fillH(walls, 8, 3, 12);
    fillV(walls, 18, 3, 10);
    fillH(walls, 12, 20, 35);
    fillV(walls, 32, 13, 24);
    fillH(walls, 20, 6, 18);
    fillV(walls, 8, 15, 26);
    fillH(walls, 26, 25, 44);
  },
  (walls) => {
    // Campo D – fase 11 (Deserto): arena espaçada com obstáculos espalhados
    addBorder(walls);
    fillH(walls, 6, 8, 14);
    fillV(walls, 18, 3, 12);
    fillH(walls, 14, 22, 32);
    fillV(walls, 28, 15, 24);
    fillH(walls, 24, 4, 10);
    fillH(walls, 20, 36, 44);
    fillV(walls, 40, 8, 20);
  },
];

// ─── 3 variantes de corredor (fases 3, 7, 13) ─────────────────────────────

const CORRIDOR_LAYOUTS = [
  (walls) => {
    // Corredor A – fase 3: 3 divisórias horizontais com brechas
    addBorder(walls);
    for (let x = 2; x < W - 2; x++) {
      if (x < 12 || x > 14) walls[10][x] = TILE_INDEX.WALL;
      if (x < 28 || x > 30) walls[20][x] = TILE_INDEX.WALL;
    }
    fillV(walls, 24, 2, 9);
    fillV(walls, 10, 11, 19);
  },
  (walls) => {
    // Corredor B – fase 7: 2 divisórias verticais com brechas
    addBorder(walls);
    for (let y = 2; y < H - 2; y++) {
      if (y < 8 || y > 10) walls[y][16] = TILE_INDEX.WALL;
      if (y < 18 || y > 20) walls[y][32] = TILE_INDEX.WALL;
    }
    fillH(walls, 6, 2, 14);
    fillH(walls, 14, 18, 30);
    fillH(walls, 22, 34, 45);
  },
  (walls) => {
    // Corredor C – fase 13 (Masmorra): labirinto com múltiplas divisórias
    addBorder(walls);
    // Linhas horizontais com brechas alternadas
    for (let x = 2; x < W - 2; x++) {
      if (x < 10 || x > 12) walls[8][x] = TILE_INDEX.WALL;
      if (x < 20 || x > 22) walls[16][x] = TILE_INDEX.WALL;
      if (x < 32 || x > 34) walls[24][x] = TILE_INDEX.WALL;
    }
    // Colunas verticais para criar compartimentos
    fillV(walls, 12, 2, 7);
    fillV(walls, 22, 9, 15);
    fillV(walls, 34, 17, 23);
    fillV(walls, 42, 2, 25);
  },
];

// ─── Variantes de arena de boss ────────────────────────────────────────────

const buildArena = (walls, variant = 0) => {
  addBorder(walls);
  
  if (variant === 0) {
    // Arena padrão (fases 2, 4, 6, 8, 10)
    // Quatro pilares nos cantos internos
    [
      [4, 4],
      [4, W - 6],
      [H - 6, 4],
      [H - 6, W - 6],
    ].forEach(([r, c]) => {
      walls[r][c] = TILE_INDEX.WALL;
      walls[r][c + 1] = TILE_INDEX.WALL;
      walls[r + 1][c] = TILE_INDEX.WALL;
      walls[r + 1][c + 1] = TILE_INDEX.WALL;
    });
  } else if (variant === 1) {
    // Arena Deserto (fase 12): pilares no meio e nas extremidades
    [
      [6, 6],
      [6, W - 8],
      [H - 8, 6],
      [H - 8, W - 8],
      [H / 2 - 1, W / 2 - 2],
      [H / 2 - 1, W / 2 + 2],
    ].forEach(([r, c]) => {
      if (r >= 0 && r < H && c >= 0 && c < W) {
        walls[r][c] = TILE_INDEX.WALL;
        if (c + 1 < W) walls[r][c + 1] = TILE_INDEX.WALL;
      }
    });
  } else if (variant === 2) {
    // Arena Masmorra (fase 14): pilares em padrão diagonal
    const pillarPositions = [
      [5, 5],
      [5, W - 6],
      [H - 6, 5],
      [H - 6, W - 6],
      [12, 12],
      [12, W - 14],
      [H - 14, 12],
      [H - 14, W - 14],
    ];
    pillarPositions.forEach(([r, c]) => {
      if (r >= 0 && r < H && c >= 0 && c < W) {
        walls[r][c] = TILE_INDEX.WALL;
        if (c + 1 < W) walls[r][c + 1] = TILE_INDEX.WALL;
        if (r + 1 < H) walls[r + 1][c] = TILE_INDEX.WALL;
        if (r + 1 < H && c + 1 < W) walls[r + 1][c + 1] = TILE_INDEX.WALL;
      }
    });
  } else if (variant === 3) {
    // Arena Abismo (fase 15, clímax): estrutura épica com múltiplos pilares
    addBorder(walls);
    // Padrão de grade de pilares para máxima dificuldade
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const r = 4 + i * 7;
        const c = 4 + j * 14;
        if (r < H - 2 && c < W - 2) {
          walls[r][c] = TILE_INDEX.WALL;
          walls[r][c + 1] = TILE_INDEX.WALL;
          walls[r + 1][c] = TILE_INDEX.WALL;
          walls[r + 1][c + 1] = TILE_INDEX.WALL;
        }
      }
    }
  }
};

// ─── Spawn points ───────────────────────────────────────────────────────────

const FIELD_SPAWNS = [
  { tileX: 5, tileY: 15 },
  { tileX: 20, tileY: 5 },
  { tileX: 35, tileY: 8 },
  { tileX: 13, tileY: 22 },
  { tileX: 30, tileY: 14 },
  { tileX: 42, tileY: 20 },
  { tileX: 8, tileY: 26 },
  { tileX: 38, tileY: 26 },
];

const CORRIDOR_SPAWNS = [
  { tileX: 5, tileY: 5 },
  { tileX: 22, tileY: 5 },
  { tileX: 40, tileY: 5 },
  { tileX: 5, tileY: 15 },
  { tileX: 35, tileY: 15 },
  { tileX: 10, tileY: 25 },
  { tileX: 30, tileY: 25 },
  { tileX: 44, tileY: 25 },
];

const ARENA_SPAWNS = [
  { tileX: 10, tileY: 8 },
  { tileX: 38, tileY: 8 },
  { tileX: 10, tileY: 22 },
  { tileX: 38, tileY: 22 },
  { tileX: 24, tileY: 4 },
  { tileX: 24, tileY: 26 },
];

const ABYSS_SPAWNS = [
  // Fases 15 (clímax) tem mais spawn points e mais espaçados
  { tileX: 8, tileY: 8 },
  { tileX: 40, tileY: 8 },
  { tileX: 8, tileY: 22 },
  { tileX: 40, tileY: 22 },
  { tileX: 24, tileY: 4 },
  { tileX: 24, tileY: 26 },
  { tileX: 5, tileY: 15 },
  { tileX: 43, tileY: 15 },
];

// ─── Gerador principal ──────────────────────────────────────────────────────

/**
 * Gera o mapa para a fase indicada.
 * Suporte para fases 1-15 com 3 blocos temáticos:
 * - Bloco 1 (1-10): Clássico (Campo/Floresta/Ruínas/Vulcão/Cristal)
 * - Bloco 2 (11-15): Deserto/Masmorra/Abismo
 */
export const generatePhaseMap = (phase) => {
  const ground = create2D(W, H, TILE_INDEX.GRASS);
  const walls = create2D(W, H, -1);

  let spawns;
  let bossSpawn = null;

  // Lógica para fases 11-15 (novo bloco)
  if (phase >= 11 && phase <= 15) {
    if (phase === 11) {
      // Fase 11: Campo do Deserto
      FIELD_LAYOUTS[3](walls); // Variante D
      spawns = FIELD_SPAWNS;
    } else if (phase === 12) {
      // Fase 12: Boss do Deserto
      buildArena(walls, 1);
      spawns = ARENA_SPAWNS;
      bossSpawn = { tileX: Math.floor(W / 2), tileY: Math.floor(H / 2) };
    } else if (phase === 13) {
      // Fase 13: Masmorra (Corredor complexo)
      CORRIDOR_LAYOUTS[2](walls); // Variante C
      spawns = CORRIDOR_SPAWNS;
    } else if (phase === 14) {
      // Fase 14: Boss da Masmorra
      buildArena(walls, 2);
      spawns = ARENA_SPAWNS;
      bossSpawn = { tileX: Math.floor(W / 2), tileY: Math.floor(H / 2) };
    } else if (phase === 15) {
      // Fase 15: Clímax - Trono do Abismo
      buildArena(walls, 3);
      spawns = ABYSS_SPAWNS;
      bossSpawn = { tileX: Math.floor(W / 2), tileY: Math.floor(H / 2) };
    }
  } else {
    // Lógica original para fases 1-10
    const isBoss = phase % 2 === 0;

    if (isBoss) {
      buildArena(walls, 0);
      spawns = ARENA_SPAWNS;
      bossSpawn = { tileX: Math.floor(W / 2), tileY: Math.floor(H / 2) };
    } else {
      // nonBossIdx: phase 1→0, 3→1, 5→2, 7→3, 9→4
      const nbIdx = Math.floor((phase - 1) / 2);

      if (nbIdx % 2 === 0) {
        // Campo: variante 0 (fase1), 1 (fase5), 2 (fase9)
        FIELD_LAYOUTS[Math.floor(nbIdx / 2)](walls);
        spawns = FIELD_SPAWNS;
      } else {
        // Corredor: variante 0 (fase3), 1 (fase7)
        CORRIDOR_LAYOUTS[Math.floor((nbIdx - 1) / 2)](walls);
        spawns = CORRIDOR_SPAWNS;
      }
    }
  }

  return {
    id: `phase-${phase}`,
    width: W,
    height: H,
    ground,
    walls,
    spawn: { tileX: 3, tileY: 3 },
    enemySpawns: spawns,
    bossSpawn,
  };
};

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

// ─── 3 variantes de campo aberto (fases 1, 5, 9) ───────────────────────────

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
];

// ─── 2 variantes de corredor (fases 3, 7) ──────────────────────────────────

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
];

// ─── Arena de boss (fases pares) ───────────────────────────────────────────

const buildArena = (walls) => {
  addBorder(walls);
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

// ─── Gerador principal ──────────────────────────────────────────────────────

/**
 * Gera o mapa para a fase indicada.
 * Fases pares → arena de boss.
 * Fases 1/5/9 → campo aberto (variantes A/B/C).
 * Fases 3/7   → corredores (variantes A/B).
 */
export const generatePhaseMap = (phase) => {
  const ground = create2D(W, H, TILE_INDEX.GRASS);
  const walls = create2D(W, H, -1);

  const isBoss = phase % 2 === 0;

  let spawns;

  if (isBoss) {
    buildArena(walls);
    spawns = ARENA_SPAWNS;
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

  return {
    id: `phase-${phase}`,
    width: W,
    height: H,
    ground,
    walls,
    spawn: { tileX: 3, tileY: 3 },
    enemySpawns: spawns,
    bossSpawn: isBoss
      ? { tileX: Math.floor(W / 2), tileY: Math.floor(H / 2) }
      : null,
  };
};

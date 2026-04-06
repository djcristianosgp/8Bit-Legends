import { TILE_INDEX } from '../mapConstants';

const MAP_WIDTH = 48;
const MAP_HEIGHT = 30;

const create2D = (width, height, fill) =>
  Array.from({ length: height }, () => Array(width).fill(fill));

export const createStarterFieldMap = () => {
  const ground = create2D(MAP_WIDTH, MAP_HEIGHT, TILE_INDEX.GRASS);
  const walls = create2D(MAP_WIDTH, MAP_HEIGHT, -1);

  for (let x = 0; x < MAP_WIDTH; x += 1) {
    walls[0][x] = TILE_INDEX.WALL;
    walls[MAP_HEIGHT - 1][x] = TILE_INDEX.WALL;
  }

  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    walls[y][0] = TILE_INDEX.WALL;
    walls[y][MAP_WIDTH - 1] = TILE_INDEX.WALL;
  }

  for (let x = 7; x <= 18; x += 1) {
    walls[8][x] = TILE_INDEX.WALL;
  }

  for (let y = 12; y <= 24; y += 1) {
    walls[y][20] = TILE_INDEX.WALL;
  }

  for (let x = 24; x <= 36; x += 1) {
    walls[18][x] = TILE_INDEX.WALL;
  }

  for (let y = 4; y <= 13; y += 1) {
    walls[y][34] = TILE_INDEX.WALL;
  }

  return {
    id: 'starter-field',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    ground,
    walls,
    spawn: { tileX: 4, tileY: 4 },
  };
};

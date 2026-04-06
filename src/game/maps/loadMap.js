import { TILE_INDEX, TILE_SIZE } from './mapConstants';
import { getMapById } from './mapRegistry';

export const loadMap = (scene, mapId) => {
  const mapData = getMapById(mapId);

  const map = scene.make.tilemap({
    width: mapData.width,
    height: mapData.height,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
  });

  const tileset = map.addTilesetImage('rpg_tileset', 'tiles-rpg');

  if (!tileset) {
    throw new Error('Falha ao criar tileset do mapa.');
  }

  const groundLayer = map.createBlankLayer('Ground', tileset, 0, 0);
  groundLayer.putTilesAt(mapData.ground, 0, 0);
  groundLayer.setDepth(0);

  const wallLayer = map.createBlankLayer('Walls', tileset, 0, 0);
  wallLayer.putTilesAt(mapData.walls, 0, 0);
  wallLayer.setDepth(1);
  wallLayer.setCollision([TILE_INDEX.WALL]);

  const worldWidth = mapData.width * TILE_SIZE;
  const worldHeight = mapData.height * TILE_SIZE;

  scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

  const bossSpawnPoint = mapData.bossSpawn
    ? {
        x: (mapData.bossSpawn.tileX + 0.5) * TILE_SIZE,
        y: (mapData.bossSpawn.tileY + 0.5) * TILE_SIZE,
      }
    : null;

  return {
    map,
    groundLayer,
    wallLayer,
    spawnPoint: {
      x: (mapData.spawn.tileX + 0.5) * TILE_SIZE,
      y: (mapData.spawn.tileY + 0.5) * TILE_SIZE,
    },
    worldSize: {
      width: worldWidth,
      height: worldHeight,
    },
    enemySpawnPoints: (mapData.enemySpawns ?? []).map((spawn) => ({
      x: (spawn.tileX + 0.5) * TILE_SIZE,
      y: (spawn.tileY + 0.5) * TILE_SIZE,
    })),
    bossSpawnPoint,
  };
};

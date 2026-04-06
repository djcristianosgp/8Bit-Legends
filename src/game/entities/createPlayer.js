export const createPlayer = (scene, x, y) => {
  const player = scene.physics.add.sprite(x, y, 'player', 0);
  player.setScale(2);
  player.setOrigin(0.5, 0.5);
  player.setDepth(2);

  const body = player.body;
  body.setCollideWorldBounds(true);
  body.setSize(10, 14);
  body.setOffset(11, 17);
  body.setMaxVelocity(230, 230);

  return player;
};

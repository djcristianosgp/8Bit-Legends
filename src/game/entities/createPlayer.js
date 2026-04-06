export const createPlayer = (scene, x, y) => {
  const player = scene.add.rectangle(x, y, 28, 36, 0x57e389);
  scene.physics.add.existing(player);

  const body = player.body;
  body.setCollideWorldBounds(true);
  body.setSize(28, 36);
  body.setMaxVelocity(230, 230);

  return player;
};

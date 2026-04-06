export const PLAYER_ANIMS = {
  idleDown: 'player-idle-down',
  idleLeft: 'player-idle-left',
  idleRight: 'player-idle-right',
  idleUp: 'player-idle-up',
  walkDown: 'player-walk-down',
  walkLeft: 'player-walk-left',
  walkRight: 'player-walk-right',
  walkUp: 'player-walk-up',
};

export const createPlayerAnimations = (scene) => {
  const { anims } = scene;

  if (anims.exists(PLAYER_ANIMS.walkDown)) {
    return;
  }

  anims.create({
    key: PLAYER_ANIMS.idleDown,
    frames: [{ key: 'player', frame: 0 }],
    frameRate: 1,
    repeat: -1,
  });

  anims.create({
    key: PLAYER_ANIMS.idleLeft,
    frames: [{ key: 'player', frame: 3 }],
    frameRate: 1,
    repeat: -1,
  });

  anims.create({
    key: PLAYER_ANIMS.idleRight,
    frames: [{ key: 'player', frame: 6 }],
    frameRate: 1,
    repeat: -1,
  });

  anims.create({
    key: PLAYER_ANIMS.idleUp,
    frames: [{ key: 'player', frame: 9 }],
    frameRate: 1,
    repeat: -1,
  });

  anims.create({
    key: PLAYER_ANIMS.walkDown,
    frames: anims.generateFrameNumbers('player', { frames: [0, 1, 2] }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: PLAYER_ANIMS.walkLeft,
    frames: anims.generateFrameNumbers('player', { frames: [3, 4, 5] }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: PLAYER_ANIMS.walkRight,
    frames: anims.generateFrameNumbers('player', { frames: [6, 7, 8] }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: PLAYER_ANIMS.walkUp,
    frames: anims.generateFrameNumbers('player', { frames: [9, 10, 11] }),
    frameRate: 10,
    repeat: -1,
  });
};

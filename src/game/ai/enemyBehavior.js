const ENEMY_PATROL_SPEED = 70;
const ENEMY_CHASE_SPEED = 110;
const ENEMY_DETECTION_RADIUS = 170;

const randomDirection = () => {
  const options = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 0, y: 0 },
  ];

  return options[Math.floor(Math.random() * options.length)];
};

export const createEnemyAiState = (timeNow) => ({
  mode: 'patrol',
  direction: randomDirection(),
  nextDirectionChangeAt: timeNow + 800 + Math.random() * 800,
});

export const updateEnemyBehavior = (enemy, player, now) => {
  if (!enemy.active || !enemy.body) {
    return;
  }

  const toPlayerX = player.x - enemy.x;
  const toPlayerY = player.y - enemy.y;
  const distance = Math.hypot(toPlayerX, toPlayerY);

  if (distance <= ENEMY_DETECTION_RADIUS) {
    enemy.ai.mode = 'chase';
  } else {
    enemy.ai.mode = 'patrol';
  }

  if (enemy.ai.mode === 'chase') {
    const dirX = distance > 0 ? toPlayerX / distance : 0;
    const dirY = distance > 0 ? toPlayerY / distance : 0;
    enemy.body.setVelocity(dirX * ENEMY_CHASE_SPEED, dirY * ENEMY_CHASE_SPEED);
    return;
  }

  if (now >= enemy.ai.nextDirectionChangeAt) {
    enemy.ai.direction = randomDirection();
    enemy.ai.nextDirectionChangeAt = now + 700 + Math.random() * 900;
  }

  enemy.body.setVelocity(
    enemy.ai.direction.x * ENEMY_PATROL_SPEED,
    enemy.ai.direction.y * ENEMY_PATROL_SPEED,
  );
};

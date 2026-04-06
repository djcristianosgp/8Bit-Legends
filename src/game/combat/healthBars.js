const PLAYER_BAR_WIDTH = 180;
const PLAYER_BAR_HEIGHT = 18;
const ENEMY_BAR_WIDTH = 28;
const ENEMY_BAR_HEIGHT = 5;

const drawBar = (graphics, x, y, width, height, percent, colors) => {
  graphics.clear();
  graphics.fillStyle(colors.background, 0.95);
  graphics.fillRect(x, y, width, height);
  graphics.fillStyle(colors.fill, 1);
  graphics.fillRect(x + 2, y + 2, (width - 4) * percent, height - 4);
  graphics.lineStyle(2, colors.border, 1);
  graphics.strokeRect(x, y, width, height);
};

export const createPlayerHealthBar = (scene, stats) => {
  const graphics = scene.add.graphics().setScrollFactor(0).setDepth(30);
  const label = scene.add
    .text(14, 10, 'HP', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#f8f3e6',
    })
    .setScrollFactor(0)
    .setDepth(31);

  const update = () => {
    const percent = stats.health / stats.maxHealth;
    drawBar(graphics, 44, 10, PLAYER_BAR_WIDTH, PLAYER_BAR_HEIGHT, percent, {
      background: 0x2a2238,
      fill: 0x5fd389,
      border: 0xf4c25b,
    });
  };

  update();

  return {
    update,
    destroy: () => {
      graphics.destroy();
      label.destroy();
    },
  };
};

export const attachEnemyHealthBar = (scene, enemy) => {
  const graphics = scene.add.graphics().setDepth(6);

  const update = () => {
    if (!enemy.active) {
      graphics.clear();
      return;
    }

    const percent = enemy.stats.health / enemy.stats.maxHealth;
    const x = enemy.x - ENEMY_BAR_WIDTH / 2;
    const y = enemy.y - 30;

    drawBar(graphics, x, y, ENEMY_BAR_WIDTH, ENEMY_BAR_HEIGHT, percent, {
      background: 0x1f1f27,
      fill: 0xde5f5f,
      border: 0x22222a,
    });
  };

  enemy.healthBar = {
    update,
    destroy: () => graphics.destroy(),
  };

  return enemy.healthBar;
};

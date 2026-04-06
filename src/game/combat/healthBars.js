const PLAYER_BAR_WIDTH = 180;
const PLAYER_BAR_HEIGHT = 18;
const ENEMY_BAR_WIDTH = 28;
const ENEMY_BAR_HEIGHT = 5;
const BOSS_BAR_WIDTH = 62;
const BOSS_BAR_HEIGHT = 8;

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
    .text(14, 10, 'LIFE', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#f5e8bc',
      stroke: '#1a1624',
      strokeThickness: 3,
    })
    .setScrollFactor(0)
    .setDepth(31);

  const update = () => {
    const percent = stats.health / stats.maxHealth;
    drawBar(graphics, 50, 10, PLAYER_BAR_WIDTH, PLAYER_BAR_HEIGHT, percent, {
      background: 0x1c2130,
      fill: 0x7adf74,
      border: 0xe7b95a,
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
  const isBoss = enemy.isBoss === true;
  const barW = isBoss ? BOSS_BAR_WIDTH : ENEMY_BAR_WIDTH;
  const barH = isBoss ? BOSS_BAR_HEIGHT : ENEMY_BAR_HEIGHT;
  const yOffset = isBoss ? -52 : -30;

  const update = () => {
    if (!enemy.active) {
      graphics.clear();
      return;
    }

    const percent = enemy.stats.health / enemy.stats.maxHealth;
    const x = enemy.x - barW / 2;
    const y = enemy.y + yOffset;

    drawBar(graphics, x, y, barW, barH, percent, {
      background: 0x161b27,
      fill: isBoss ? 0xff6f4a : 0xeb7272,
      border: isBoss ? 0x6b1a0f : 0x242b39,
    });
  };

  enemy.healthBar = {
    update,
    destroy: () => graphics.destroy(),
  };

  return enemy.healthBar;
};

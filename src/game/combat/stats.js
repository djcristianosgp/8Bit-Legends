const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createCombatStats = ({ maxHealth, attack, defense }) => ({
  maxHealth,
  health: maxHealth,
  attack,
  defense,
});

export const calculateDamage = (attackerStats, defenderStats) => {
  const spread = Math.floor(Math.random() * 5) - 2;
  const rawDamage = attackerStats.attack - defenderStats.defense + spread;
  return Math.max(1, rawDamage);
};

export const applyDamage = (defenderStats, amount) => {
  defenderStats.health = clamp(defenderStats.health - amount, 0, defenderStats.maxHealth);
  return defenderStats.health;
};

export const isDead = (stats) => stats.health <= 0;

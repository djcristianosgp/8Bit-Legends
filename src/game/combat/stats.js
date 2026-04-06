const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createCombatStats = ({ maxHealth, attack, defense }) => ({
  maxHealth,
  health: maxHealth,
  attack,
  defense,
  bonusAttack: 0,
  bonusSpeed: 0,
  weaponAttackBonus: 0,
});

export const getAttackValue = (stats) =>
  stats.attack + (stats.bonusAttack ?? 0) + (stats.weaponAttackBonus ?? 0);

export const getMoveSpeed = (stats, baseSpeed) => baseSpeed + (stats.bonusSpeed ?? 0);

export const calculateDamage = (attackerStats, defenderStats) => {
  const spread = Math.floor(Math.random() * 5) - 2;
  const rawDamage = getAttackValue(attackerStats) - defenderStats.defense + spread;
  return Math.max(1, rawDamage);
};

export const applyDamage = (defenderStats, amount) => {
  defenderStats.health = clamp(defenderStats.health - amount, 0, defenderStats.maxHealth);
  return defenderStats.health;
};

export const heal = (targetStats, amount) => {
  targetStats.health = clamp(targetStats.health + amount, 0, targetStats.maxHealth);
  return targetStats.health;
};

export const isDead = (stats) => stats.health <= 0;

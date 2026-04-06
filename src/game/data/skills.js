export const SKILL_TYPES = {
  PROJECTILE: 'projectile',
  AREA: 'area',
  BUFF: 'buff',
};

export const SKILL_CONFIG = {
  fireball: {
    key: 'fireball',
    name: 'Fireball',
    hotkey: '1',
    damage: 20,
    cooldown: 1800,
    type: SKILL_TYPES.PROJECTILE,
    projectileSpeed: 320,
    projectileLifetime: 1200,
    color: 0xff7a45,
  },
  lightning: {
    key: 'lightning',
    name: 'Lightning',
    hotkey: '2',
    damage: 38,
    cooldown: 4200,
    type: SKILL_TYPES.AREA,
    range: 220,
    color: 0x8bc8ff,
  },
  aura: {
    key: 'aura',
    name: 'Aura',
    hotkey: '3',
    damage: 0,
    cooldown: 8000,
    type: SKILL_TYPES.BUFF,
    duration: 4500,
    attackBonus: 6,
    speedBonus: 28,
    color: 0xb980ff,
  },
};

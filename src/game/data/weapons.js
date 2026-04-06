export const WEAPON_TYPES = {
  SWORD: 'melee',
  BOW: 'ranged',
  STAFF: 'magic',
};

export const WEAPON_CONFIG = {
  sword: {
    id: 'sword',
    name: 'Sword',
    type: WEAPON_TYPES.SWORD,
    baseAttack: 4,
    attackSpeed: 1.08,
    arrowMultiplier: 1,
    skillMultiplier: 0.95,
    color: 0xdccf9d,
    dropWeight: 45,
  },
  bow: {
    id: 'bow',
    name: 'Bow',
    type: WEAPON_TYPES.BOW,
    baseAttack: 2,
    attackSpeed: 1.22,
    arrowMultiplier: 1.45,
    skillMultiplier: 1,
    color: 0x71c4ff,
    dropWeight: 30,
  },
  staff: {
    id: 'staff',
    name: 'Staff',
    type: WEAPON_TYPES.STAFF,
    baseAttack: 1,
    attackSpeed: 1,
    arrowMultiplier: 0.92,
    skillMultiplier: 1.6,
    color: 0xbe86ff,
    dropWeight: 25,
  },
};

export const DEFAULT_WEAPON_ID = 'sword';

export const getWeaponConfig = (weaponId = DEFAULT_WEAPON_ID) =>
  WEAPON_CONFIG[weaponId] ?? WEAPON_CONFIG[DEFAULT_WEAPON_ID];

export const rollWeaponType = () => {
  const pool = Object.values(WEAPON_CONFIG);
  const total = pool.reduce((sum, weapon) => sum + weapon.dropWeight, 0);
  let roll = Math.random() * Math.max(1, total);

  for (const weapon of pool) {
    roll -= weapon.dropWeight;
    if (roll <= 0) {
      return weapon.id;
    }
  }

  return DEFAULT_WEAPON_ID;
};

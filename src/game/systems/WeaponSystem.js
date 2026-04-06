import { getRarityConfig } from '../data/rarities';
import { DEFAULT_WEAPON_ID, getWeaponConfig, WEAPON_TYPES } from '../data/weapons';
import { showCollectFeedback } from '../items/dropSystem';

export class WeaponSystem {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.equipped = null;
  }

  create(player) {
    this.player = player;
    this.equipWeapon(DEFAULT_WEAPON_ID, 'common', { silent: true });
  }

  equipWeapon(weaponId, rarity = 'common', options = {}) {
    const weapon = getWeaponConfig(weaponId);
    const rarityConfig = getRarityConfig(rarity);
    const rarityBonus = Math.max(0, rarityConfig.multiplier - 1);

    this.equipped = {
      id: weapon.id,
      name: weapon.name,
      type: weapon.type,
      rarity: rarityConfig.id,
      rarityLabel: rarityConfig.label,
      displayName: `${rarityConfig.label} ${weapon.name}`,
      attackBonus: Math.round(weapon.baseAttack * rarityConfig.multiplier),
      attackSpeed: weapon.attackSpeed,
      arrowMultiplier:
        weapon.arrowMultiplier * (1 + rarityBonus * (weapon.type === WEAPON_TYPES.BOW ? 1 : 0.35)),
      skillMultiplier:
        weapon.skillMultiplier * (1 + rarityBonus * (weapon.type === WEAPON_TYPES.STAFF ? 1 : 0.25)),
      color: rarityConfig.color,
      textColor: rarityConfig.textColor,
    };

    if (this.player?.stats) {
      this.player.stats.weaponAttackBonus = this.equipped.attackBonus;
    }

    if (!options.silent && this.player) {
      showCollectFeedback(
        this.scene,
        this.player.x,
        this.player.y - 8,
        `Arma equipada: ${this.equipped.displayName}`,
        this.equipped.textColor,
      );
    }

    return this.equipped;
  }

  getAttackSpeedMultiplier() {
    return this.equipped?.attackSpeed ?? 1;
  }

  getArrowDamage(baseDamage) {
    const damage = Number(baseDamage) || 0;
    return Math.max(1, Math.round(damage * (this.equipped?.arrowMultiplier ?? 1)));
  }

  getSkillDamage(baseDamage) {
    const damage = Number(baseDamage) || 0;
    return Math.max(1, Math.round(damage * (this.equipped?.skillMultiplier ?? 1)));
  }

  getWeaponLabel() {
    return this.equipped ? `${this.equipped.displayName} [${this.equipped.type}]` : 'Sem arma';
  }

  serialize() {
    return this.equipped
      ? {
          id: this.equipped.id,
          rarity: this.equipped.rarity,
        }
      : null;
  }
}

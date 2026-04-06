import Phaser from 'phaser';
import { calculateDamage, applyDamage, isDead } from '../combat/stats';

const ARROW_SPEED = 220;
const ARROW_SPAWN_INTERVAL = 1000; // 1 segundo
const ARROW_SIZE = 8;
const MAX_ARROWS = 20;

/**
 * ArrowSystem: Sistema de flechas teleguiadas que perseguem inimigos
 * - Flechas são disparadas automaticamente a cada 1 segundo
 * - Sempre buscam o inimigo mais próximo
 * - Seguem (tracking) o alvo continuamente
 * - Causam dano que escala com a fase
 */
export class ArrowSystem {
  constructor(scene, phase = 1) {
    this.scene = scene;
    this.phase = phase;
    this.baseDamage = 8;
    this.arrowsGroup = null;
    this.lastArrowSpawnAt = 0;
    this.isActive = false;
  }

  /**
   * Inicializa o sistema (deve ser chamado em create() da scene)
   */
  create() {
    this.arrowsGroup = this.scene.physics.add.group({
      defaultKey: undefined,
      maxSize: MAX_ARROWS,
    });

    this.isActive = true;
  }

  /**
   * Atualiza o sistema (deve ser chamado em update() da scene)
   * - Verifica se é hora de disparar nova flecha
   * - Atualiza trajetória das flechas existentes
   * - Remove flechas sem alvo ou destruídas
   */
  update(time, player, enemies) {
    if (!this.isActive || !player || !enemies) {
      return;
    }

    const attackSpeedMultiplier = this.scene.weaponSystem?.getAttackSpeedMultiplier() ?? 1;
    const spawnInterval = Math.max(360, ARROW_SPAWN_INTERVAL / attackSpeedMultiplier);

    // Tenta disparar nova flecha respeitando a velocidade da arma equipada
    if (time - this.lastArrowSpawnAt >= spawnInterval) {
      this.lastArrowSpawnAt = time;
      this.spawnArrow(player, enemies);
    }

    // Atualiza trajetória de cada flecha
    this.arrowsGroup.children.iterate((arrow) => {
      if (!arrow || !arrow.active) {
        return;
      }

      // Verifica se o alvo ainda está vivo
      if (arrow.target && arrow.target.active && !isDead(arrow.target.stats)) {
        this.updateArrowTracking(arrow, arrow.target);
      } else {
        // Alvo morreu ou foi destruído, procura novo alvo
        const newTarget = this.findNearestEnemy(arrow, enemies);
        if (newTarget) {
          arrow.target = newTarget;
          this.updateArrowTracking(arrow, newTarget);
        } else {
          // Sem alvo, destrói a flecha
          arrow.destroy();
        }
      }
    });
  }

  /**
   * Dispara uma nova flecha em direção ao inimigo mais próximo
   */
  spawnArrow(player, enemies) {
    // Encontra o inimigo mais próximo
    const target = this.findNearestEnemy(player, enemies);
    if (!target || !target.active || isDead(target.stats)) {
      return;
    }

    // Cria a flecha com um círculo simples como texture
    const arrow = this.arrowsGroup.create(player.x, player.y, 'arrow');
    if (!arrow) {
      return; // Grupo está cheio
    }

    // Configuração do sprite
    arrow.setOrigin(0.5, 0.5);
    arrow.setScale(1.5);
    arrow.setDepth(1);

    const baseDamage = this.baseDamage + this.phase * 2;
    const adjustedDamage = this.scene.weaponSystem?.getArrowDamage(baseDamage) ?? baseDamage;
    arrow.setData('damage', adjustedDamage);

    // Configuração do body física
    arrow.body.setBounce(0, 0);
    arrow.body.setCollideWorldBounds(false);
    arrow.body.onWorldBounds = false;

    // Armazena alvo e configuração
    arrow.target = target;
    arrow.isArrow = true;

    // Primeira direção
    this.updateArrowTracking(arrow, target);
  }

  /**
   * Atualiza a trajetória da flecha em direção ao alvo
   */
  updateArrowTracking(arrow, target) {
    if (!arrow || !target) {
      return;
    }

    const dx = target.x - arrow.x;
    const dy = target.y - arrow.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      return;
    }

    const velX = (dx / dist) * ARROW_SPEED;
    const velY = (dy / dist) * ARROW_SPEED;

    arrow.body.setVelocity(velX, velY);

    // Rotaciona a flecha na direção do movimento
    arrow.rotation = Math.atan2(dy, dx);
  }

  /**
   * Encontra o inimigo mais próximo de um ponto (player ou flecha)
   */
  findNearestEnemy(source, enemies) {
    if (!enemies || !enemies.children) {
      return null;
    }

    let nearest = null;
    let minDist = Infinity;

    enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active || !enemy.stats) {
        return;
      }

      if (isDead(enemy.stats)) {
        return;
      }

      const dist = Phaser.Math.Distance.Between(source.x, source.y, enemy.x, enemy.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  /**
   * Processa colisão entre flecha e inimigo
   * Retorna true se houve colisão e o inimigo foi eliminado
   */
  processArrowEnemyCollision(arrow, enemy, onEnemyDefeated = () => {}) {
    if (!arrow || !arrow.active || !arrow.isArrow) {
      return false;
    }

    if (!enemy || !enemy.active || !enemy.stats) {
      return false;
    }

    const damage = arrow.getData('damage') || this.baseDamage;
    applyDamage(enemy.stats, damage);

    enemy.lastReceivedHitAt = Date.now();
    if (enemy.healthBar) {
      enemy.healthBar.update();
    }

    // Efeito visual
    const flash = this.scene.add.circle(arrow.x, arrow.y, 12, 0xffd700, 0.4);
    flash.setDepth(1);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy(),
    });

    arrow.destroy();

    if (isDead(enemy.stats)) {
      onEnemyDefeated(enemy);
      enemy.healthBar?.destroy();
      enemy.destroy();
      return true;
    }

    return true;
  }

  /**
   * Ativa/desativa o sistema
   */
  setActive(active) {
    this.isActive = active;
  }

  /**
   * Retorna o grupo de flechas (para colisões externas)
   */
  getGroup() {
    return this.arrowsGroup;
  }

  /**
   * Limpa todas as flechas
   */
  clear() {
    if (this.arrowsGroup) {
      this.arrowsGroup.clear(true, true);
    }
  }

  /**
   * Atualiza a fase (ajusta o dano das próximas flechas)
   */
  setPhase(phase) {
    this.phase = Math.max(1, phase);
  }

  /**
   * Destroi o sistema completamente
   */
  destroy() {
    this.clear();
    this.arrowsGroup?.destroy();
    this.isActive = false;
  }
}

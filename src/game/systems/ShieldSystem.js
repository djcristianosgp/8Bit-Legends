import Phaser from 'phaser';

const SHIELD_DURATION = 10000; // 10 segundos
const SHIELD_COOLDOWN = 15000; // 15 segundos
const SHIELD_ACTIVATION_KEY = 'SHIFT';
const SHIELD_DAMAGE_REDUCTION = 0.8; // 80% de redução
const SHIELD_RADIUS = 48;

/**
 * ShieldSystem: Sistema de escudo que reduz dano do player
 * - Ativação via tecla SHIFT
 * - Duração: 10 segundos
 * - Cooldown: 15 segundos
 * - Reduz dano em 80% quando ativo
 * - Visual: círculo ao redor do player com animação
 */
export class ShieldSystem {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.isOnCooldown = false;
    this.shieldVisual = null;
    this.shieldGlow = null;
    this.cooldownTimerEvent = null;
    this.durationTimerEvent = null;
    this.shieldKey = null;
    this.lastActivationTime = -Infinity;
  }

  /**
   * Inicializa o sistema (deve ser chamado em create() da scene)
   * @param {Phaser.Physics.Arcade.Sprite} player - referência do player
   */
  create(player) {
    this.player = player;

    // Registra o input da tecla SHIFT
    this.shieldKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[SHIELD_ACTIVATION_KEY],
    );

    // Cria o visual do escudo (círculo)
    this.shieldVisual = this.scene.add.circle(0, 0, SHIELD_RADIUS, 0x4eb3f5, 0.22);
    this.shieldVisual.setDepth(1);
    this.shieldVisual.setStrokeStyle(2, 0x7ad9ff, 0.9);
    this.shieldVisual.setVisible(false);

    this.shieldGlow = this.scene.add.circle(0, 0, SHIELD_RADIUS + 8, 0x7ad9ff, 0.1);
    this.shieldGlow.setDepth(0.95);
    this.shieldGlow.setVisible(false);
  }

  /**
   * Atualiza o sistema (deve ser chamado em update() da scene)
   */
  update(time) {
    if (!this.player || !this.player.active) {
      return;
    }

    // Posiciona o visual do escudo sobre o player
    if (this.shieldVisual && this.isActive) {
      this.shieldVisual.setPosition(this.player.x, this.player.y);
      this.shieldGlow?.setPosition(this.player.x, this.player.y);
    }

    // Verifica se o jogador pressionou SHIFT para ativar
    if (Phaser.Input.Keyboard.JustDown(this.shieldKey)) {
      this.tryActivateShield(time);
    }
  }

  /**
   * Tenta ativar o escudo se não estiver em cooldown
   */
  tryActivateShield(time) {
    // Evita múltiplas ativações se já estão em cooldown/ativo
    if (this.isActive || this.isOnCooldown) {
      this.showCooldownFeedback();
      return;
    }

    this.lastActivationTime = time;
    this.activateShield();
  }

  /**
   * Ativa o escudo
   */
  activateShield() {
    this.isActive = true;
    this.isOnCooldown = true;

    // Mostra o visual
    if (this.shieldVisual) {
      this.shieldVisual.setVisible(true);
      this.shieldGlow?.setVisible(true);
      this.startShieldPulseAnimation();
    }

    // Timer para desativar após SHIELD_DURATION
    if (this.durationTimerEvent) {
      this.durationTimerEvent.remove();
    }

    this.durationTimerEvent = this.scene.time.delayedCall(SHIELD_DURATION, () => {
      this.deactivateShield();
    });

    // Timer para sair do cooldown
    if (this.cooldownTimerEvent) {
      this.cooldownTimerEvent.remove();
    }

    this.cooldownTimerEvent = this.scene.time.delayedCall(SHIELD_COOLDOWN, () => {
      this.isOnCooldown = false;
    });

    // Feedback visual/sonoro
    this.showActivationFeedback();
  }

  /**
   * Desativa o escudo
   */
  deactivateShield() {
    this.isActive = false;

    if (this.shieldVisual) {
      this.shieldVisual.setVisible(false);
      this.shieldGlow?.setVisible(false);
    }

    if (this.durationTimerEvent) {
      this.durationTimerEvent.remove();
      this.durationTimerEvent = null;
    }

    this.showDeactivationFeedback();
  }

  /**
   * Retorna true se o escudo está ativo
   */
  isShieldActive() {
    return this.isActive;
  }

  /**
   * Retorna o fator de redução de dano (1.0 = sem redução, 0.2 = 80% redução)
   */
  getDamageReductionFactor() {
    return this.isActive ? 1 - SHIELD_DAMAGE_REDUCTION : 1.0;
  }

  /**
   * Retorna o tempo restante do escudo (em ms)
   */
  getRemainingShieldTime() {
    if (!this.isActive || !this.durationTimerEvent) {
      return 0;
    }
    return Math.max(0, this.durationTimerEvent.getRemainingSeconds() * 1000);
  }

  /**
   * Retorna o tempo restante do cooldown (em ms)
   */
  getRemainingCooldown() {
    if (!this.isOnCooldown || !this.cooldownTimerEvent) {
      return 0;
    }
    return Math.max(0, this.cooldownTimerEvent.getRemainingSeconds() * 1000);
  }

  /**
   * Animação: pulso do escudo
   */
  startShieldPulseAnimation() {
    if (!this.shieldVisual) {
      return;
    }

    // Remove tweens anteriores
    this.scene.tweens.killTweensOf(this.shieldVisual);
    if (this.shieldGlow) {
      this.scene.tweens.killTweensOf(this.shieldGlow);
    }

    // Animação de pulse contínua enquanto estiver ativo
    this.scene.tweens.add({
      targets: this.shieldVisual,
      scale: [1, 1.12, 1],
      duration: 800,
      repeat: -1,
      yoyo: false,
    });

    this.scene.tweens.add({
      targets: this.shieldVisual,
      alpha: [0.2, 0.42, 0.2],
      duration: 800,
      repeat: -1,
      yoyo: false,
    });

    if (this.shieldGlow) {
      this.scene.tweens.add({
        targets: this.shieldGlow,
        scale: [1, 1.18, 1],
        alpha: [0.08, 0.2, 0.08],
        duration: 900,
        repeat: -1,
        yoyo: false,
      });
    }
  }

  /**
   * Feedback visual: ativação
   */
  showActivationFeedback() {
    if (!this.player) {
      return;
    }

    // Adiciona um texto flutuante "ESCUDO!"
    const feedbackText = this.scene.add
      .text(this.player.x, this.player.y - 40, 'ESCUDO!', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#4eb3f5',
        stroke: '#1a3a52',
        strokeThickness: 3,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    this.scene.tweens.add({
      targets: feedbackText,
      y: this.player.y - 80,
      alpha: 0,
      duration: 800,
      onComplete: () => feedbackText.destroy(),
    });
  }

  /**
   * Feedback visual: deativação
   */
  showDeactivationFeedback() {
    if (!this.player) {
      return;
    }

    const feedbackText = this.scene.add
      .text(this.player.x, this.player.y - 40, 'Escudo Desativado', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#ff9999',
        stroke: '#4a1a1a',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    this.scene.tweens.add({
      targets: feedbackText,
      y: this.player.y - 70,
      alpha: 0,
      duration: 600,
      onComplete: () => feedbackText.destroy(),
    });
  }

  /**
   * Feedback visual: tentativa de ativação em cooldown
   */
  showCooldownFeedback() {
    if (!this.player) {
      return;
    }

    const cooldownRemaining = this.getRemainingCooldown();
    const secondsLeft = Math.ceil(cooldownRemaining / 1000);

    const feedbackText = this.scene.add
      .text(this.player.x, this.player.y - 40, `Cooldown: ${secondsLeft}s`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#ffaa00',
        stroke: '#4a2a00',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    this.scene.tweens.add({
      targets: feedbackText,
      y: this.player.y - 60,
      alpha: 0,
      duration: 500,
      onComplete: () => feedbackText.destroy(),
    });
  }

  /**
   * Destroi o sistema completamente
   */
  destroy() {
    if (this.durationTimerEvent) {
      this.durationTimerEvent.remove();
    }

    if (this.cooldownTimerEvent) {
      this.cooldownTimerEvent.remove();
    }

    if (this.shieldVisual) {
      this.shieldVisual.destroy();
    }

    if (this.shieldGlow) {
      this.shieldGlow.destroy();
    }

    if (this.shieldKey) {
      // Não destroi a key, pois é gerenciada pelo scene.input.keyboard
    }

    this.isActive = false;
    this.isOnCooldown = false;
  }
}

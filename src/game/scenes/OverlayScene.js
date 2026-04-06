import Phaser from 'phaser';
import { TOTAL_PHASES } from '../phases/phaseConfig';
import { readFromStorage, writeToStorage } from '../save/saveStorage';

export const OVERLAY_SCENE_KEY = 'OverlayScene';

/**
 * Cena de overlay para vitória, derrota e fim de jogo.
 * Renderiza sobre a MainScene sem encerrá-la diretamente.
 * ENTER ou clique avança para a próxima fase / reinicia.
 */
export class OverlayScene extends Phaser.Scene {
  constructor() {
    super(OVERLAY_SCENE_KEY);
  }

  /**
   * @param {{ type: 'victory'|'defeat'|'gameover', phase: number, nextPhase?: number }} data
   */
  init(data) {
    this.overlayType = data.type;
    this.phase = data.phase ?? 1;
    this.nextPhase = data.nextPhase ?? 2;
    this.countdownSeconds = 15;
    this.countdownEvent = null;
    this.actionText = null;
    this._confirmed = false;
  }

  create() {
    const { width, height } = this.scale;

    // Fundo semi-transparente
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x060a14, 0.72)
      .setScrollFactor(0)
      .setDepth(40);

    const isVictory = this.overlayType === 'victory';
    const isGameOver = this.overlayType === 'gameover';
    const isDefeat = this.overlayType === 'defeat';

    // ── Título ────────────────────────────────────────────────────────────────
    const titleText = isGameOver
      ? '🏆  Parabéns, Herói!'
      : isVictory
        ? `✦  Fase ${this.phase} Completa!`
        : '✗  Derrota!';

    const titleColor = isGameOver ? '#f4c25b' : isVictory ? '#6de38f' : '#ff8b8b';

    const titleObj = this.add
      .text(width / 2, height / 2 - 56, titleText, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '30px',
        color: titleColor,
        stroke: '#06090f',
        strokeThickness: 7,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    // Pulso suave no título
    this.tweens.add({
      targets: titleObj,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Subtítulo ─────────────────────────────────────────────────────────────
    const nextIsBoss = this.nextPhase % 2 === 0;
    const bossTag = nextIsBoss && isVictory ? '  ☠ BOSS' : '';

    const subtitleText = isGameOver
      ? `Você derrotou todos os ${TOTAL_PHASES} chefes e salvou o reino!`
      : isVictory
        ? `Próxima: Fase ${this.nextPhase}${bossTag}`
        : `Você foi derrotado na Fase ${this.phase}`;

    this.add
      .text(width / 2, height / 2 + 4, subtitleText, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '17px',
        color: '#e0d8cc',
        stroke: '#06090f',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    // ── Dica de controle ──────────────────────────────────────────────────────
    this.add
      .text(width / 2, height / 2 + 52, 'Clique no botão ou aguarde a contagem.', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#7a7090',
        stroke: '#06090f',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    // ── Fase se derrota ───────────────────────────────────────────────────────
    if (isDefeat) {
      this.add
        .text(width / 2, height / 2 + 32, 'Seus itens e status foram preservados.', {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '13px',
          color: '#c8a060',
          stroke: '#06090f',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(50);
    }

    const actionLabel = isDefeat
      ? 'Tentar novamente'
      : isGameOver
        ? 'Reiniciar jornada'
        : 'Próxima fase';

    const buttonY = height / 2 + (isDefeat ? 100 : 92);

    const buttonBg = this.add
      .rectangle(width / 2, buttonY, 220, 42, 0x284879, 0.96)
      .setStrokeStyle(2, 0xe7b95a, 1)
      .setScrollFactor(0)
      .setDepth(50)
      .setInteractive({ useHandCursor: true });

    this.actionText = this.add
      .text(width / 2, buttonY, `${actionLabel} (${this.countdownSeconds}s)`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#f8f3e6',
        stroke: '#06090f',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51)
      .setInteractive({ useHandCursor: true });

    buttonBg.on('pointerdown', () => this._confirm());
    this.actionText.on('pointerdown', () => this._confirm());

    this.input.keyboard?.once('keydown-ENTER', () => this._confirm());
    this.input.keyboard?.once('keydown-SPACE', () => this._confirm());

    this.countdownEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.countdownSeconds -= 1;

        if (this.countdownSeconds <= 0) {
          this._confirm();
          return;
        }

        this.actionText?.setText(`${actionLabel} (${this.countdownSeconds}s)`);
      },
    });
  }

  _confirm() {
    if (this._confirmed) return;
    this._confirmed = true;
    this.countdownEvent?.remove(false);

    const targetPhase =
      this.overlayType === 'defeat'
        ? this.phase
        : this.overlayType === 'gameover'
          ? 1
          : this.nextPhase;

    this.actionText?.setText('Carregando...');

    try {
      localStorage.setItem('8bl_autostart', '1');

      const saved = readFromStorage();
      if (saved && typeof saved === 'object') {
        const nextSave = {
          ...saved,
          phase: targetPhase,
          timestamp: Date.now(),
          restoreFullHealth: this.overlayType !== 'defeat',
        };

        if (this.overlayType !== 'defeat') {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('8bl_restore_full_hp', '1');
          }

          if (nextSave.player?.stats) {
            nextSave.player.stats.health = nextSave.player.stats.maxHealth;
          }
        }

        writeToStorage(nextSave);
      }
    } catch {
      // fallback silencioso; o reload ainda restaura a fase quando houver save válido
    }

    const mainScene = this.scene.get('MainScene');
    mainScene?.scene?.stop();
    this.scene.stop(OVERLAY_SCENE_KEY);

    if (typeof window !== 'undefined' && window.location) {
      window.setTimeout(() => {
        window.location.reload();
      }, 150);
      return;
    }

    this.scene.start('MainScene', { phase: targetPhase });
  }
}

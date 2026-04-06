import Phaser from 'phaser';

const MENU_WIDTH = 280;
const MENU_HEIGHT = 214;

export class PauseSystem {
  constructor(scene, callbacks = {}) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.pauseKey = null;
    this.pauseButton = null;
    this.overlay = null;
    this.isMenuPaused = false;
    this._handleResize = (gameSize) => this.layout(gameSize.width, gameSize.height);
    this._onToggleRequest = () => this.togglePause();
  }

  create() {
    this.pauseKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const bg = this.scene.add
      .rectangle(0, 0, 96, 28, 0x112443, 0.92)
      .setStrokeStyle(2, 0xe7b95a, 1)
      .setInteractive({ useHandCursor: true });

    const label = this.scene.add
      .text(0, 0, '⏸ PAUSA', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#f8f3e6',
        stroke: '#06090f',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.pauseButton = this.scene.add.container(0, 0, [bg, label]).setDepth(72).setScrollFactor(0);
    bg.on('pointerdown', () => this.togglePause());

    const dim = this.scene.add
      .rectangle(0, 0, 10, 10, 0x02050a, 0.74)
      .setOrigin(0)
      .setInteractive()
      .setScrollFactor(0);

    const panel = this.scene.add
      .rectangle(0, 0, MENU_WIDTH, MENU_HEIGHT, 0x0b1627, 0.96)
      .setStrokeStyle(3, 0x5d7aa5, 1)
      .setScrollFactor(0);

    const title = this.scene.add
      .text(0, -68, 'Jogo Pausado', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '24px',
        color: '#f4c25b',
        stroke: '#06090f',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    title.setData('offsetY', -68);

    const hint = this.scene.add
      .text(0, -36, 'ESC ou botão para continuar', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#cbd6eb',
        stroke: '#06090f',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    hint.setData('offsetY', -36);

    this.overlay = this.scene.add.container(0, 0, [
      dim,
      panel,
      title,
      hint,
      this.createActionButton(-74, 'Continuar', () => {
        this.scene.audioSystem?.playUiConfirm();
        this.resumeGame();
      }),
      this.createActionButton(-18, 'Reiniciar Fase', () => {
        this.scene.audioSystem?.playUiConfirm();
        this.forceClose();
        this.callbacks.onRestartPhase?.();
      }),
      this.createActionButton(38, 'Reiniciar Jogo', () => {
        if (typeof window !== 'undefined' && !window.confirm('Deseja reiniciar todo o jogo?')) {
          this.scene.audioSystem?.playError();
          return;
        }
        this.scene.audioSystem?.playUiConfirm();
        this.forceClose();
        this.callbacks.onRestartGame?.();
      }, 0x6a2530),
    ])
      .setDepth(71)
      .setScrollFactor(0)
      .setVisible(false)
      .setAlpha(0);

    this.layout(this.scene.scale.width, this.scene.scale.height);
    this.scene.scale.on('resize', this._handleResize);
    this.scene.game.events.on('toggle-pause', this._onToggleRequest, this);
  }

  createActionButton(offsetY, text, onClick, fill = 0x243f6a) {
    const bg = this.scene.add
      .rectangle(0, 0, 176, 34, fill, 0.96)
      .setStrokeStyle(2, 0xe7b95a, 1)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const label = this.scene.add
      .text(0, 0, text, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#f8f3e6',
        stroke: '#06090f',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    bg.on('pointerdown', onClick);
    const container = this.scene.add.container(0, offsetY, [bg, label]);
    container.setData('offsetY', offsetY);
    return container;
  }

  layout(width, height) {
    this.pauseButton?.setPosition(width - 68, 24);

    if (!this.overlay) {
      return;
    }

    const [dim, panel] = this.overlay.list;
    dim.setSize(width, height);
    dim.setPosition(0, 0);
    panel.setPosition(width / 2, height / 2);

    this.overlay.list.forEach((child, index) => {
      if (index < 2) {
        return;
      }

      const offsetY = child.getData?.('offsetY') ?? child.y ?? 0;
      child.setPosition(width / 2, height / 2 + offsetY);
    });
  }

  update() {
    if (this.pauseKey && Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
    }
  }

  isPaused() {
    return this.isMenuPaused;
  }

  togglePause() {
    if (this.scene.phaseClear) {
      return;
    }

    if (this.isMenuPaused) {
      this.scene.audioSystem?.playUiClose();
      this.resumeGame();
      return;
    }

    this.scene.audioSystem?.playUiClick();
    this.pauseGame();
  }

  pauseGame() {
    if (this.isMenuPaused) {
      return;
    }

    this.isMenuPaused = true;
    this.scene.isGameplayPaused = true;
    this.scene.player?.body?.setVelocity(0, 0);
    this.scene.physics.world.pause();
    this.scene.anims.pauseAll();
    this.scene.time.timeScale = 0;
    this.scene.audioSystem?.setPaused(true);

    this.overlay?.setVisible(true);
    this.overlay?.setAlpha(0);
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 1,
      duration: 120,
      ease: 'Quad.Out',
      onComplete: () => this.scene.tweens.pauseAll(),
    });

    this.scene.publishSharedState?.('Pausado');
  }

  resumeGame() {
    if (!this.isMenuPaused) {
      return;
    }

    this.isMenuPaused = false;
    this.scene.isGameplayPaused = false;
    this.scene.physics.world.resume();
    this.scene.anims.resumeAll();
    this.scene.time.timeScale = 1;
    this.scene.tweens.resumeAll();
    this.scene.audioSystem?.setPaused(false);

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: 110,
      ease: 'Quad.Out',
      onComplete: () => this.overlay?.setVisible(false),
    });

    this.scene.publishSharedState?.(this.scene.getCurrentStatusLabel?.() ?? 'Explorando');
  }

  forceClose() {
    this.isMenuPaused = false;
    this.scene.isGameplayPaused = false;
    this.scene.physics.world.resume();
    this.scene.anims.resumeAll();
    this.scene.time.timeScale = 1;
    this.scene.tweens.resumeAll();
    this.scene.audioSystem?.setPaused(false);
    this.overlay?.setVisible(false);
    this.overlay?.setAlpha(0);
  }

  destroy() {
    this.scene.scale.off('resize', this._handleResize);
    this.scene.game.events.off('toggle-pause', this._onToggleRequest, this);
    this.pauseButton?.destroy(true);
    this.overlay?.destroy(true);
    this.pauseButton = null;
    this.overlay = null;
  }
}

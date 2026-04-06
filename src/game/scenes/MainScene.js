import Phaser from 'phaser';
import { createPlayer } from '../entities/createPlayer';

const PLAYER_SPEED = 180;

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.player = null;
    this.cursors = null;
    this.wasd = null;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    this.player = createPlayer(this, width / 2, height / 2);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
    });
  }

  update() {
    if (!this.player) {
      return;
    }

    const velocity = new Phaser.Math.Vector2(0, 0);

    const moveLeft = this.cursors.left.isDown || this.wasd.left.isDown;
    const moveRight = this.cursors.right.isDown || this.wasd.right.isDown;
    const moveUp = this.cursors.up.isDown || this.wasd.up.isDown;
    const moveDown = this.cursors.down.isDown || this.wasd.down.isDown;

    if (moveLeft) velocity.x -= 1;
    if (moveRight) velocity.x += 1;
    if (moveUp) velocity.y -= 1;
    if (moveDown) velocity.y += 1;

    velocity.normalize().scale(PLAYER_SPEED);
    this.player.body.setVelocity(velocity.x, velocity.y);
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;

    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    if (!this.player) {
      return;
    }

    this.player.x = Phaser.Math.Clamp(this.player.x, 14, width - 14);
    this.player.y = Phaser.Math.Clamp(this.player.y, 18, height - 18);
  }
}

import Phaser from 'phaser';
import { createPlayer } from '../entities/createPlayer';
import { createPlayerAnimations, PLAYER_ANIMS } from '../animations/playerAnimations';

const PLAYER_SPEED = 180;
const PLAYER_HALF_WIDTH = 10;
const PLAYER_HALF_HEIGHT = 14;

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.facing = 'down';
  }

  preload() {
    this.load.spritesheet('player', '/assets/sprites/player_sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    createPlayerAnimations(this);
    this.player = createPlayer(this, width / 2, height / 2);
    this.player.anims.play(PLAYER_ANIMS.idleDown, true);

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

    if (moveLeft) {
      velocity.x -= 1;
      this.facing = 'left';
    }

    if (moveRight) {
      velocity.x += 1;
      this.facing = 'right';
    }

    if (moveUp) {
      velocity.y -= 1;
      this.facing = 'up';
    }

    if (moveDown) {
      velocity.y += 1;
      this.facing = 'down';
    }

    velocity.normalize().scale(PLAYER_SPEED);
    this.player.body.setVelocity(velocity.x, velocity.y);

    this.updateAnimation(velocity.lengthSq() > 0);
  }

  updateAnimation(isMoving) {
    if (!this.player) {
      return;
    }

    const walkAnimByDirection = {
      down: PLAYER_ANIMS.walkDown,
      left: PLAYER_ANIMS.walkLeft,
      right: PLAYER_ANIMS.walkRight,
      up: PLAYER_ANIMS.walkUp,
    };

    const idleAnimByDirection = {
      down: PLAYER_ANIMS.idleDown,
      left: PLAYER_ANIMS.idleLeft,
      right: PLAYER_ANIMS.idleRight,
      up: PLAYER_ANIMS.idleUp,
    };

    const targetAnim = isMoving
      ? walkAnimByDirection[this.facing]
      : idleAnimByDirection[this.facing];

    if (this.player.anims.currentAnim?.key !== targetAnim) {
      this.player.anims.play(targetAnim, true);
    }
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;

    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);

    if (!this.player) {
      return;
    }

    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      PLAYER_HALF_WIDTH,
      width - PLAYER_HALF_WIDTH,
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      PLAYER_HALF_HEIGHT,
      height - PLAYER_HALF_HEIGHT,
    );
  }
}

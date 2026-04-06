import Phaser from 'phaser';
import { createPlayer } from '../entities/createPlayer';
import { createPlayerAnimations, PLAYER_ANIMS } from '../animations/playerAnimations';
import { DEFAULT_MAP_ID } from '../maps/mapRegistry';
import { loadMap } from '../maps/loadMap';
import { createEnemy } from '../entities/createEnemy';
import { updateEnemyBehavior } from '../ai/enemyBehavior';
import { attachEnemyHealthBar, createPlayerHealthBar } from '../combat/healthBars';
import { performPlayerAttack, processContactDamage } from '../combat/combatSystem';
import { isDead } from '../combat/stats';

const PLAYER_SPEED = 180;
const PLAYER_ATTACK_COOLDOWN = 280;

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.facing = 'down';
    this.worldSize = { width: 0, height: 0 };
    this.enemies = null;
    this.attackKey = null;
    this.playerHealthBar = null;
    this.lastPlayerAttackAt = -10000;
  }

  preload() {
    this.load.spritesheet('player', '/assets/sprites/player_sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.image('tiles-rpg', '/assets/tiles/rpg_tileset.png');
  }

  create() {
    const mapState = loadMap(this, DEFAULT_MAP_ID);
    this.worldSize = mapState.worldSize;

    createPlayerAnimations(this);
    this.player = createPlayer(this, mapState.spawnPoint.x, mapState.spawnPoint.y);
    this.player.anims.play(PLAYER_ANIMS.idleDown, true);
    this.physics.add.collider(this.player, mapState.wallLayer);
    this.playerHealthBar = createPlayerHealthBar(this, this.player.stats);

    this.enemies = this.physics.add.group();
    mapState.enemySpawnPoints.forEach((spawn) => {
      const enemy = createEnemy(this, spawn.x, spawn.y);
      attachEnemyHealthBar(this, enemy);
      this.enemies.add(enemy);
    });

    this.physics.add.collider(this.enemies, mapState.wallLayer);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyOverlap, null, this);

    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
    camera.startFollow(this.player, true, 0.15, 0.15);
    camera.roundPixels = true;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.playerHealthBar?.destroy();
      this.enemies?.children.iterate((enemy) => enemy?.healthBar?.destroy());
    });
  }

  update(time) {
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
    this.updateEnemies(time);
    this.tryPlayerAttack(time);
  }

  updateEnemies(time) {
    if (!this.enemies) {
      return;
    }

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) {
        return;
      }

      updateEnemyBehavior(enemy, this.player, time);
      enemy.healthBar?.update();
    });
  }

  tryPlayerAttack(time) {
    if (!Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      return;
    }

    if (time - this.lastPlayerAttackAt < PLAYER_ATTACK_COOLDOWN) {
      return;
    }

    this.lastPlayerAttackAt = time;
    performPlayerAttack({
      scene: this,
      player: this.player,
      enemies: this.enemies,
      facing: this.facing,
      now: time,
    });
  }

  onPlayerEnemyOverlap(player, enemy) {
    const didTakeDamage = processContactDamage({
      player,
      enemy,
      now: this.time.now,
      cooldownMs: 850,
    });

    if (didTakeDamage) {
      this.playerHealthBar?.update();
    }

    if (isDead(player.stats)) {
      player.body.setVelocity(0, 0);
      this.scene.restart();
    }
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

    this.cameras.main.setBounds(
      0,
      0,
      this.worldSize.width,
      this.worldSize.height,
    );
    this.cameras.main.setSize(width, height);
  }
}

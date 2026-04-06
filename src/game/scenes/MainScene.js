import Phaser from 'phaser';
import { createPlayer } from '../entities/createPlayer';
import { createPlayerAnimations, PLAYER_ANIMS } from '../animations/playerAnimations';
import { DEFAULT_MAP_ID } from '../maps/mapRegistry';
import { loadMap } from '../maps/loadMap';
import { createEnemy } from '../entities/createEnemy';
import { updateEnemyBehavior } from '../ai/enemyBehavior';
import { attachEnemyHealthBar, createPlayerHealthBar } from '../combat/healthBars';
import { performPlayerAttack, processContactDamage } from '../combat/combatSystem';
import { getAttackValue, getMoveSpeed, isDead } from '../combat/stats';
import { createInventory, addItemToInventory } from '../items/inventory';
import { ITEM_CONFIG, rollEnemyDrop } from '../items/itemDefinitions';
import { applyItemEffect } from '../items/itemEffects';
import { createDropGroup, showCollectFeedback, spawnItemDrop } from '../items/dropSystem';

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
    this.itemDrops = null;
    this.inventory = null;
    this.inventoryText = null;
    this.currentMapId = null;
  }

  preload() {
    this.load.spritesheet('player', '/assets/sprites/player_sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.image('tiles-rpg', '/assets/tiles/rpg_tileset.png');
  }

  create() {
    this.currentMapId = DEFAULT_MAP_ID;
    const mapState = loadMap(this, this.currentMapId);
    this.worldSize = mapState.worldSize;

    createPlayerAnimations(this);
    this.player = createPlayer(this, mapState.spawnPoint.x, mapState.spawnPoint.y);
    this.player.anims.play(PLAYER_ANIMS.idleDown, true);
    this.physics.add.collider(this.player, mapState.wallLayer);
    this.playerHealthBar = createPlayerHealthBar(this, this.player.stats);

    this.inventory = createInventory();
    this.inventoryText = this.add
      .text(14, 34, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#f8f3e6',
        stroke: '#1b1f2d',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(31);
    this.updateInventoryHud();

    this.itemDrops = createDropGroup(this);
    this.physics.add.overlap(this.player, this.itemDrops, this.onPlayerCollectDrop, null, this);

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
      this.inventoryText?.destroy();
    });

    this.time.addEvent({
      delay: 30_000,
      loop: true,
      callback: () => {
        if (this.player?.active && !isDead(this.player.stats)) {
          this.game.events.emit('save-trigger');
        }
      },
    });

    this.game.events.emit('scene-ready', this);
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

    velocity.normalize().scale(getMoveSpeed(this.player.stats, PLAYER_SPEED));
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
      onEnemyDefeated: (enemy) => {
        const dropType = rollEnemyDrop();

        if (dropType) {
          spawnItemDrop(this, this.itemDrops, dropType, enemy.x, enemy.y);
        }
      },
    });
  }

  onPlayerCollectDrop(player, drop) {
    if (!drop?.active || !drop.itemType) {
      return;
    }

    const itemType = drop.itemType;
    const itemConfig = ITEM_CONFIG[itemType];
    const effectText = applyItemEffect({ player, itemType });

    addItemToInventory(this.inventory, itemType);
    this.playerHealthBar?.update();
    this.updateInventoryHud();

    showCollectFeedback(
      this,
      drop.x,
      drop.y,
      `${itemConfig.label} ${effectText}`,
      '#f8f3e6',
    );

    drop.destroy();
  }

  updateInventoryHud() {
    if (!this.inventoryText || !this.player) {
      return;
    }

    const attackTotal = getAttackValue(this.player.stats);
    const speedTotal = getMoveSpeed(this.player.stats, PLAYER_SPEED);

    this.inventoryText.setText(
      [
        `Itens  Vida:${this.inventory.health}  Forca:${this.inventory.strength}  Vel:${this.inventory.speed}`,
        `Atributos  ATQ:${attackTotal}  DEF:${this.player.stats.defense}  MOV:${Math.round(speedTotal)}`,
      ].join('\n'),
    );
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

  applySave(data) {
    const safeNum = (v, min, max) => Math.min(Math.max(Number(v) || 0, min), max);
    const VALID_FACINGS = ['down', 'up', 'left', 'right'];

    const maxHp = safeNum(data.player.stats.maxHealth, 1, 9999);
    this.player.stats.maxHealth = maxHp;
    this.player.stats.health = safeNum(data.player.stats.health, 1, maxHp);
    this.player.stats.attack = safeNum(data.player.stats.attack, 0, 999);
    this.player.stats.defense = safeNum(data.player.stats.defense, 0, 999);
    this.player.stats.bonusAttack = safeNum(data.player.stats.bonusAttack, 0, 999);
    this.player.stats.bonusSpeed = safeNum(data.player.stats.bonusSpeed, 0, 999);

    this.player.x = safeNum(data.player.x, 0, this.worldSize.width);
    this.player.y = safeNum(data.player.y, 0, this.worldSize.height);
    this.facing = VALID_FACINGS.includes(data.player.facing) ? data.player.facing : 'down';

    this.inventory.health = safeNum(data.inventory.health, 0, 9999);
    this.inventory.strength = safeNum(data.inventory.strength, 0, 9999);
    this.inventory.speed = safeNum(data.inventory.speed, 0, 9999);

    this.playerHealthBar?.update();
    this.updateInventoryHud();
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

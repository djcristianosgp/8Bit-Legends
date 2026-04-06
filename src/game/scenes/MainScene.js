import Phaser from 'phaser';
import { createPlayer } from '../entities/createPlayer';
import { createPlayerAnimations, PLAYER_ANIMS } from '../animations/playerAnimations';
import { loadMap } from '../maps/loadMap';
import { createEnemy } from '../entities/createEnemy';
import { createBoss } from '../entities/createBoss';
import { updateEnemyBehavior } from '../ai/enemyBehavior';
import { updateBossBehavior } from '../ai/bossBehavior';
import { attachEnemyHealthBar, createPlayerHealthBar } from '../combat/healthBars';
import { performPlayerAttack, processContactDamage } from '../combat/combatSystem';
import { getAttackValue, getMoveSpeed, isDead, applyDamage, calculateDamage } from '../combat/stats';
import { ArrowSystem } from '../systems/ArrowSystem';
import { ShieldSystem } from '../systems/ShieldSystem';
import { createInventory, addItemToInventory } from '../items/inventory';
import { ITEM_CONFIG, rollEnemyDrop } from '../items/itemDefinitions';
import { applyItemEffect } from '../items/itemEffects';
import { createDropGroup, showCollectFeedback, spawnItemDrop } from '../items/dropSystem';
import { getPhaseConfig, getDifficultyFactor, TOTAL_PHASES } from '../phases/phaseConfig';
import { OVERLAY_SCENE_KEY } from './OverlayScene';
import { serializeScene } from '../save/saveSerializer';
import { writeToStorage } from '../save/saveStorage';

const PLAYER_SPEED = 180;
const PLAYER_ATTACK_COOLDOWN = 280;
const ENEMY_UPDATE_INTERVAL_MS = 33;
const STATE_PUBLISH_INTERVAL_MS = 120;

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
    /** Fase atual (1-10). Definida em init() antes de create(). */
    this.startPhase = 1;
    /** true enquanto o overlay de vitória/derrota está ativo */
    this.phaseClear = false;
    this.phaseText = null;
    this.playerName = 'Heroi';
    this.playerNameText = null;
    this.statusText = null;
    this.stateStore = null;
    this.socketSync = null;

    this.mobileInput = {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
    };
    this.mobileAttackQueued = false;

    this.lastEnemyUpdateAt = 0;
    this.lastStatePublishAt = 0;

    // Systems
    this.arrowSystem = null;
    this.shieldSystem = null;
  }

  /**
   * Phaser chama init() antes de create(). Usa o phase passado pelo OverlayScene
   * ou, na primeira carga, lê do localStorage para restaurar o progresso.
   */
  init(data) {
    if (data?.phase != null) {
      this.startPhase = Math.max(1, Math.min(TOTAL_PHASES, Number(data.phase) || 1));
      return;
    }

    // Primeira carga: tenta restaurar fase salva
    try {
      const raw = localStorage.getItem('8bitlegends_save');
      const saved = raw ? JSON.parse(raw) : null;
      const savedPhase = saved?.phase;
      this.startPhase =
        Number.isInteger(savedPhase) && savedPhase >= 1 && savedPhase <= TOTAL_PHASES
          ? savedPhase
          : 1;
    } catch {
      this.startPhase = 1;
    }

    this.playerName = (this.registry.get('playerName') ?? 'Heroi').trim() || 'Heroi';
    this.stateStore = this.registry.get('stateStore') ?? null;
    this.socketSync = this.registry.get('socketSync') ?? null;
  }

  preload() {
    this.load.spritesheet('player', '/assets/sprites/player_sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Carrega todos os tilesets de biomas
    this.load.image('tiles-rpg', '/assets/tiles/rpg_tileset.png');
    this.load.image('tiles-forest', '/assets/tiles/biome_forest.png');
    this.load.image('tiles-ruins', '/assets/tiles/biome_ruins.png');
    this.load.image('tiles-volcano', '/assets/tiles/biome_volcano.png');
    this.load.image('tiles-crystal', '/assets/tiles/biome_crystal.png');

    this.load.image('arrow', '/assets/sprites/arrow.png');
    this.load.image('shield', '/assets/sprites/shield.png');
  }

  create() {
    const phaseConfig = getPhaseConfig(this.startPhase);
    const diffFactor = getDifficultyFactor(this.startPhase);

    this.phaseClear = false;
    this.currentMapId = phaseConfig.mapId;

    const mapState = loadMap(this, this.currentMapId, this.startPhase);
    this.worldSize = mapState.worldSize;

    createPlayerAnimations(this);
    this.player = createPlayer(this, mapState.spawnPoint.x, mapState.spawnPoint.y);
    this.player.anims.play(PLAYER_ANIMS.idleDown, true);
    this.physics.add.collider(this.player, mapState.wallLayer);
    this.playerHealthBar = createPlayerHealthBar(this, this.player.stats);

    // ── HUD: inventário ────────────────────────────────────────────────────
    this.inventory = createInventory();
    this.inventoryText = this.add
      .text(14, 96, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#f2e7cc',
        stroke: '#171b27',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(31);
    this.updateInventoryHud();

    // ── HUD: fase ──────────────────────────────────────────────────────────
    this.phaseText = this.add
      .text(this.scale.width - 14, 10, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#f0c46b',
        stroke: '#171b27',
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(31)
      .setOrigin(1, 0);
    this.updatePhaseHud();

    this.playerNameText = this.add
      .text(14, 60, `Nome ${this.playerName}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#a8d7ff',
        stroke: '#171b27',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(31);

    this.statusText = this.add
      .text(14, 78, 'Status Explorando', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#bde5b8',
        stroke: '#171b27',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(31);

    // ── Drops ──────────────────────────────────────────────────────────────
    this.itemDrops = createDropGroup(this);
    this.physics.add.overlap(this.player, this.itemDrops, this.onPlayerCollectDrop, null, this);

    // ── Inimigos ───────────────────────────────────────────────────────────
    this.enemies = this.physics.add.group();

    const enemySpawns = mapState.enemySpawnPoints.slice(0, phaseConfig.enemyCount);
    enemySpawns.forEach((spawn) => {
      const enemy = createEnemy(this, spawn.x, spawn.y, diffFactor);
      attachEnemyHealthBar(this, enemy);
      this.enemies.add(enemy);
    });

    // ── Arrow System ───────────────────────────────────────────────────────────
    this.arrowSystem = new ArrowSystem(this, this.startPhase);
    this.arrowSystem.create();

    // ── Boss (apenas em fases pares) ───────────────────────────────────────
    if (phaseConfig.isBoss && mapState.bossSpawnPoint) {
      const boss = createBoss(
        this,
        mapState.bossSpawnPoint.x,
        mapState.bossSpawnPoint.y,
        diffFactor,
      );
      attachEnemyHealthBar(this, boss);
      this.enemies.add(boss);
    }

    this.physics.add.collider(this.enemies, mapState.wallLayer);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyOverlap, null, this);

    // ── Arrow-Enemy Collisions ─────────────────────────────────────────────────
    this.physics.add.overlap(
      this.arrowSystem.getGroup(),
      this.enemies,
      (arrow, enemy) => {
        this.arrowSystem.processArrowEnemyCollision(arrow, enemy, (defeatedEnemy) => {
          const dropType = rollEnemyDrop();
          if (dropType) {
            spawnItemDrop(this, this.itemDrops, dropType, defeatedEnemy.x, defeatedEnemy.y);
          }
          this.time.delayedCall(50, () => this.checkPhaseClear());
        });
      },
      null,
      this,
    );

    // ── Shield System ─────────────────────────────────────────────────────────
    this.shieldSystem = new ShieldSystem(this);
    this.shieldSystem.create(this.player);

    // ── Câmera ─────────────────────────────────────────────────────────────
    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
    camera.startFollow(this.player, true, 0.15, 0.15);
    camera.roundPixels = true;

    // ── Controles ──────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.game.events.on('mobile-input', this.onMobileInput, this);

    // ── Ciclo de vida ──────────────────────────────────────────────────────
    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.playerHealthBar?.destroy();
      this.enemies?.children.iterate((e) => e?.healthBar?.destroy());
      this.inventoryText?.destroy();
      this.phaseText?.destroy();
      this.playerNameText?.destroy();
      this.statusText?.destroy();
      this.game.events.off('mobile-input', this.onMobileInput, this);
      this.arrowSystem?.destroy();
      this.shieldSystem?.destroy();
    });

    // Auto-save a cada 30s (só quando o player está vivo)
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
    this.publishSharedState('Explorando');
  }

  update(time) {
    if (!this.player || this.phaseClear) {
      return;
    }

    let moveX = 0;
    let moveY = 0;

    const moveLeft = this.cursors.left.isDown || this.wasd.left.isDown || this.mobileInput.left;
    const moveRight = this.cursors.right.isDown || this.wasd.right.isDown || this.mobileInput.right;
    const moveUp = this.cursors.up.isDown || this.wasd.up.isDown || this.mobileInput.up;
    const moveDown = this.cursors.down.isDown || this.wasd.down.isDown || this.mobileInput.down;

    if (moveLeft) {
      moveX -= 1;
      this.facing = 'left';
    }

    if (moveRight) {
      moveX += 1;
      this.facing = 'right';
    }

    if (moveUp) {
      moveY -= 1;
      this.facing = 'up';
    }

    if (moveDown) {
      moveY += 1;
      this.facing = 'down';
    }

    const speed = getMoveSpeed(this.player.stats, PLAYER_SPEED);
    const len = Math.hypot(moveX, moveY) || 1;
    const velX = (moveX / len) * speed;
    const velY = (moveY / len) * speed;
    this.player.body.setVelocity(velX, velY);

    this.updateAnimation(moveX !== 0 || moveY !== 0);

    if (time - this.lastEnemyUpdateAt >= ENEMY_UPDATE_INTERVAL_MS) {
      this.lastEnemyUpdateAt = time;
      this.updateEnemies(time);
    }

    this.tryPlayerAttack(time);

    // Update systems
    this.arrowSystem?.update(time, this.player, this.enemies);
    this.shieldSystem?.update(time);

    if (time - this.lastStatePublishAt >= STATE_PUBLISH_INTERVAL_MS) {
      this.lastStatePublishAt = time;
      this.publishSharedState(this.getCurrentStatusLabel());
    }
  }

  updateEnemies(time) {
    if (!this.enemies) {
      return;
    }

    this.enemies.children.iterate((entity) => {
      if (!entity || !entity.active) {
        return;
      }

      if (entity.isBoss) {
        updateBossBehavior(entity, this.player, time, this);
      } else {
        updateEnemyBehavior(entity, this.player, time);
      }

      entity.healthBar?.update();
    });
  }

  tryPlayerAttack(time) {
    const isKeyboardAttack = Phaser.Input.Keyboard.JustDown(this.attackKey);
    const isMobileAttack = this.mobileAttackQueued;

    if (!isKeyboardAttack && !isMobileAttack) {
      return;
    }

    this.mobileAttackQueued = false;

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

        // Verifica limpeza da fase após a iteração acabar
        this.time.delayedCall(50, () => this.checkPhaseClear());
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

  /**
   * Verifica se todos os inimigos (incluindo boss) foram eliminados.
   * Se sim, salva o progresso, congela a cena e lança o overlay de vitória.
   */
  checkPhaseClear() {
    if (this.phaseClear) return;
    if (!this.enemies || this.enemies.countActive(true) > 0) return;

    this.phaseClear = true;
    this.publishSharedState('Transicao');

    if (this.player?.body) {
      this.player.body.setVelocity(0, 0);
    }

    const isFinal = this.startPhase >= TOTAL_PHASES;

    // Salva com a fase seguinte para que o próximo load comece no lugar certo
    try {
      const saveData = serializeScene(this);
      saveData.phase = isFinal ? 1 : this.startPhase + 1;
      writeToStorage(saveData);
    } catch {
      // Falha silenciosa; o save manual ainda está disponível
    }

    this.time.delayedCall(700, () => {
      this.scene.launch(OVERLAY_SCENE_KEY, {
        type: isFinal ? 'gameover' : 'victory',
        phase: this.startPhase,
        nextPhase: this.startPhase + 1,
      });
    });
  }

  updatePhaseHud() {
    if (!this.phaseText) return;

    const config = getPhaseConfig(this.startPhase);
    const bossTag = config.isBoss ? '  ☠ BOSS' : '';
    this.phaseText.setText(`Fase ${this.startPhase} / ${TOTAL_PHASES}${bossTag}`);

    // Tint especial em fases de boss
    this.phaseText.setColor(config.isBoss ? '#ff7070' : '#f4c25b');
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

  getCurrentStatusLabel() {
    if (this.phaseClear) return 'Transicao';

    if (this.enemies) {
      let isBossAlive = false;
      let closeEnemy = false;

      this.enemies.children.iterate((entity) => {
        if (!entity?.active) return;
        if (entity.isBoss) {
          isBossAlive = true;
        }

        if (!closeEnemy) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entity.x, entity.y);
          if (dist < 130) {
            closeEnemy = true;
          }
        }
      });

      if (isBossAlive) return 'Boss Fight';
      if (closeEnemy) return 'Combate';
    }

    return 'Explorando';
  }

  publishSharedState(statusLabel) {
    const snapshot = {
      playerName: this.playerName,
      phase: this.startPhase,
      hp: this.player.stats.health,
      maxHp: this.player.stats.maxHealth,
      status: statusLabel,
      inventory: {
        health: this.inventory.health,
        strength: this.inventory.strength,
        speed: this.inventory.speed,
      },
    };

    this.stateStore?.patch(snapshot);
    this.socketSync?.publishLocalState(snapshot);

    if (this.statusText) {
      this.statusText.setText(`Status ${statusLabel}`);
      this.statusText.setColor(statusLabel === 'Boss Fight' ? '#ff9090' : '#bde5b8');
    }
  }

  onMobileInput(payload) {
    const next = {
      up: Boolean(payload?.up),
      down: Boolean(payload?.down),
      left: Boolean(payload?.left),
      right: Boolean(payload?.right),
      attack: Boolean(payload?.attack),
    };

    if (!this.mobileInput.attack && next.attack) {
      this.mobileAttackQueued = true;
    }

    this.mobileInput = next;
  }

  onPlayerEnemyOverlap(player, enemy) {
    // Stomp do boss encurta o cooldown de contato (ataque mais rápido)
    const isStomping = enemy.isBoss && enemy.ai?.bossMode === 'stomp';
    const cooldownMs = isStomping ? 300 : 850;

    let didTakeDamage = processContactDamage({
      player,
      enemy,
      now: this.time.now,
      cooldownMs,
    });

    // Apply shield damage reduction
    if (didTakeDamage && this.shieldSystem?.isShieldActive()) {
      const shieldReduction = this.shieldSystem.getDamageReductionFactor();
      // Recalculate damage based on shield reduction
      const actualDamage = Math.floor(calculateDamage(enemy.stats, player.stats) * shieldReduction);
      const healBack = calculateDamage(enemy.stats, player.stats) - actualDamage;
      if (healBack > 0) {
        player.stats.health = Math.min(player.stats.health + healBack, player.stats.maxHealth);
      }
    }

    if (didTakeDamage) {
      this.playerHealthBar?.update();
      this.publishSharedState(this.getCurrentStatusLabel());
    }

    if (isDead(player.stats)) {
      player.body.setVelocity(0, 0);
      this.phaseClear = true; // congela o update loop
      this.publishSharedState('Derrota');

      this.time.delayedCall(450, () => {
        this.scene.launch(OVERLAY_SCENE_KEY, { type: 'defeat', phase: this.startPhase });
      });
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

    // Se a fase salva for diferente da atual, reinicia na fase correta.
    // Isso garante que "Importar save" troque de fase corretamente.
    const savedPhase =
      Number.isInteger(data.phase) && data.phase >= 1 && data.phase <= TOTAL_PHASES
        ? data.phase
        : 1;

    if (savedPhase !== this.startPhase) {
      this.scene.restart({ phase: savedPhase });
      return;
    }

    if (typeof data.playerName === 'string' && data.playerName.trim().length > 0) {
      this.playerName = data.playerName.trim();
      this.registry.set('playerName', this.playerName);
      this.playerNameText?.setText(`Nome ${this.playerName}`);
    }

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
    this.publishSharedState(this.getCurrentStatusLabel());
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

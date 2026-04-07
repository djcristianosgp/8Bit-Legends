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
import { SkillSystem } from '../systems/SkillSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { LootSystem } from '../systems/LootSystem';
import { AmbienceSystem } from '../systems/AmbienceSystem';
import { VisualEffectsSystem } from '../systems/VisualEffectsSystem';
import { PauseSystem } from '../systems/PauseSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { AUDIO_ASSETS, AudioSystem } from '../systems/AudioSystem';
import { MinimapSystem } from '../systems/MinimapSystem';
import { createInventory, addItemToInventory } from '../items/inventory';
import { ITEM_CONFIG } from '../items/itemDefinitions';
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
      skill1: false,
      skill2: false,
      skill3: false,
      shield: false,
    };
    this.mobileAttackQueued = false;
    this.mobileSkillQueued = {
      fireball: false,
      lightning: false,
      aura: false,
    };
    this.mobileShieldQueued = false;

    this.lastEnemyUpdateAt = 0;
    this.lastStatePublishAt = 0;
    this.initialEnemyCount = 0;
    this.spawnPoint = { x: 0, y: 0 };
    this.isGameplayPaused = false;

    // Systems
    this.arrowSystem = null;
    this.shieldSystem = null;
    this.skillSystem = null;
    this.weaponSystem = null;
    this.lootSystem = null;
    this.ambienceSystem = null;
    this.visualEffects = null;
    this.pauseSystem = null;
    this.weatherSystem = null;
    this.audioSystem = null;
    this.minimapSystem = null;
  }

  /**
   * Phaser chama init() antes de create(). Usa o phase passado pelo OverlayScene
   * ou, na primeira carga, lê do localStorage para restaurar o progresso.
   */
  init(data) {
    this.playerName = (this.registry.get('playerName') ?? 'Heroi').trim() || 'Heroi';
    this.stateStore = this.registry.get('stateStore') ?? null;
    this.socketSync = this.registry.get('socketSync') ?? null;
    this.deviceProfile = this.registry.get('deviceProfile') ?? {
      isMobile: false,
      reducedEffects: false,
      preferredZoom: 1.08,
      targetFps: 60,
    };

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

    Object.entries(AUDIO_ASSETS).forEach(([key, path]) => {
      if (!this.cache.audio?.exists(key)) {
        this.load.audio(key, path);
      }
    });
  }

  create() {
    const phaseConfig = getPhaseConfig(this.startPhase);
    const diffFactor = getDifficultyFactor(this.startPhase);
    const showMapHud = !this.deviceProfile?.isMobile;

    this.phaseClear = false;
    this.currentMapId = phaseConfig.mapId;

    const mapState = loadMap(this, this.currentMapId, this.startPhase);
    this.worldSize = mapState.worldSize;
    this.spawnPoint = { ...mapState.spawnPoint };

    createPlayerAnimations(this);
    this.player = createPlayer(this, mapState.spawnPoint.x, mapState.spawnPoint.y);
    this.player.anims.play(PLAYER_ANIMS.idleDown, true);
    this.physics.add.collider(this.player, mapState.wallLayer);
    this.playerHealthBar = createPlayerHealthBar(this, this.player.stats);

    this.visualEffects = new VisualEffectsSystem(this);
    this.visualEffects.create(this.player);

    this.weatherSystem = new WeatherSystem(this);
    this.weatherSystem.create({ phase: this.startPhase });

    this.audioSystem = new AudioSystem(this);
    this.audioSystem.create({
      phase: this.startPhase,
      weatherType: this.weatherSystem.getWeatherType(),
    });

    this.weaponSystem = new WeaponSystem(this);
    this.weaponSystem.create(this.player);
    this.lootSystem = new LootSystem(this);
    this.ambienceSystem = new AmbienceSystem(this);
    this.ambienceSystem.create({
      player: this.player,
      worldSize: this.worldSize,
      phase: this.startPhase,
    });

    // ── HUD: inventário ────────────────────────────────────────────────────
    this.inventory = createInventory();
    if (showMapHud) {
      this.inventoryText = this.add
        .text(22, 92, '', {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '11px',
          color: '#f2e7cc',
          stroke: '#171b27',
          strokeThickness: 3,
          lineSpacing: 2,
        })
        .setScrollFactor(0)
        .setDepth(31);
      this.updateInventoryHud();
    }

    // ── HUD: fase ──────────────────────────────────────────────────────────
    if (showMapHud) {
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
        .text(22, 58, `Nome ${this.playerName}`, {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '11px',
          color: '#a8d7ff',
          stroke: '#171b27',
          strokeThickness: 3,
        })
        .setScrollFactor(0)
        .setDepth(31);

      this.statusText = this.add
        .text(22, 74, 'Status Explorando', {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '11px',
          color: '#bde5b8',
          stroke: '#171b27',
          strokeThickness: 3,
        })
        .setScrollFactor(0)
        .setDepth(31);
    }

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

    this.initialEnemyCount = this.enemies.countActive(true);

    this.physics.add.collider(this.enemies, mapState.wallLayer);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyOverlap, null, this);

    // ── Arrow-Enemy Collisions ─────────────────────────────────────────────────
    this.physics.add.overlap(
      this.arrowSystem.getGroup(),
      this.enemies,
      (arrow, enemy) => {
        this.arrowSystem.processArrowEnemyCollision(arrow, enemy, (defeatedEnemy) => {
          this.handleEnemyDefeat(defeatedEnemy);
        });
      },
      null,
      this,
    );

    // ── Shield System ─────────────────────────────────────────────────────────
    this.shieldSystem = new ShieldSystem(this);
    this.shieldSystem.create(this.player);

    this.skillSystem = new SkillSystem(this, {
      onEnemyDefeated: (enemy) => this.handleEnemyDefeat(enemy),
    });
    this.skillSystem.create(this.player, this.enemies);

    if (showMapHud) {
      this.minimapSystem = new MinimapSystem(this);
      this.minimapSystem.create({
        player: this.player,
        enemies: this.enemies,
        worldSize: this.worldSize,
      });
    }

    this.pauseSystem = new PauseSystem(this, {
      onRestartPhase: () => this.restartCurrentPhase(),
      onRestartGame: () => this.restartGame(),
    });
    this.pauseSystem.create();

    // ── Câmera ─────────────────────────────────────────────────────────────
    const camera = this.cameras.main;
    this.physics.world.setFPS(this.deviceProfile?.targetFps ?? 60);
    camera.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
    this.updateResponsiveCamera(this.scale.width, this.scale.height);
    camera.startFollow(this.player, true, 0.12, 0.12);
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
      this.skillSystem?.destroy();
      this.ambienceSystem?.destroy();
      this.visualEffects?.destroy();
      this.pauseSystem?.destroy();
      this.weatherSystem?.destroy();
      this.audioSystem?.destroy();
      this.minimapSystem?.destroy();
      this.weaponSystem = null;
      this.lootSystem = null;
      this.ambienceSystem = null;
      this.visualEffects = null;
      this.pauseSystem = null;
      this.weatherSystem = null;
      this.audioSystem = null;
      this.minimapSystem = null;
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
    this.pauseSystem?.update(time);

    if (!this.player || this.phaseClear || this.pauseSystem?.isPaused()) {
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

    const isMoving = moveX !== 0 || moveY !== 0;
    this.updateAnimation(isMoving);

    const enemyUpdateInterval = this.deviceProfile?.reducedEffects ? 48 : ENEMY_UPDATE_INTERVAL_MS;
    if (time - this.lastEnemyUpdateAt >= enemyUpdateInterval) {
      this.lastEnemyUpdateAt = time;
      this.updateEnemies(time);
    }

    this.tryPlayerAttack(time);
    this.processQueuedMobileActions(time);

    // Update systems
    this.arrowSystem?.update(time, this.player, this.enemies);
    this.shieldSystem?.update(time);
    this.skillSystem?.update(time, this.player, this.enemies, this.facing);
    this.ambienceSystem?.update(time);
    this.weatherSystem?.update(time);
    this.visualEffects?.update(time, isMoving, this.facing);
    this.minimapSystem?.update(time);

    if (time - this.lastStatePublishAt >= STATE_PUBLISH_INTERVAL_MS) {
      this.lastStatePublishAt = time;
      this.updateInventoryHud();
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

    const attackCooldown =
      PLAYER_ATTACK_COOLDOWN / (this.weaponSystem?.getAttackSpeedMultiplier() ?? 1);

    if (time - this.lastPlayerAttackAt < attackCooldown) {
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
        this.handleEnemyDefeat(enemy);
      },
    });
  }

  processQueuedMobileActions(time) {
    if (this.mobileShieldQueued) {
      this.mobileShieldQueued = false;
      this.shieldSystem?.tryActivateShield(time);
    }

    if (this.mobileSkillQueued.fireball) {
      this.mobileSkillQueued.fireball = false;
      this.skillSystem?.tryCastFireball(time, this.facing);
    }

    if (this.mobileSkillQueued.lightning) {
      this.mobileSkillQueued.lightning = false;
      this.skillSystem?.tryCastLightning(time);
    }

    if (this.mobileSkillQueued.aura) {
      this.mobileSkillQueued.aura = false;
      this.skillSystem?.tryCastAura(time);
    }
  }

  handleEnemyDefeat(enemy) {
    const dropData = this.lootSystem?.rollDrop(enemy);

    if (dropData) {
      spawnItemDrop(this, this.itemDrops, dropData, enemy.x, enemy.y);
    }

    this.time.delayedCall(50, () => this.checkPhaseClear());
  }

  collectRemainingDrops() {
    if (!this.itemDrops?.children || !this.player) {
      return;
    }

    const pendingDrops = [];
    this.itemDrops.children.iterate((drop) => {
      if (drop?.active) {
        pendingDrops.push(drop);
      }
    });

    pendingDrops.forEach((drop) => this.onPlayerCollectDrop(this.player, drop));
  }

  onPlayerCollectDrop(player, drop) {
    const dropData =
      drop?.dropData ??
      (drop?.itemType
        ? {
            kind: 'item',
            itemType: drop.itemType,
            label: ITEM_CONFIG[drop.itemType]?.label ?? 'Item',
            textColor: '#f8f3e6',
            rarity: 'common',
          }
        : null);

    if (!drop?.active || !dropData) {
      return;
    }

    if (dropData.kind === 'weapon' && dropData.weaponId) {
      this.audioSystem?.playLootPickup();
      this.weaponSystem?.equipWeapon(dropData.weaponId, dropData.rarity);
      this.updateInventoryHud();
      this.publishSharedState(this.getCurrentStatusLabel());
      drop.destroy();
      return;
    }

    const itemType = dropData.itemType;
    const itemConfig = ITEM_CONFIG[itemType];
    if (!itemConfig) {
      drop.destroy();
      return;
    }

    const effectText = applyItemEffect({
      player,
      itemType,
      rarity: dropData.rarity,
    });

    this.audioSystem?.playLootPickup();
    addItemToInventory(this.inventory, itemType);
    this.playerHealthBar?.update();
    this.updateInventoryHud();

    showCollectFeedback(
      this,
      drop.x,
      drop.y,
      `${dropData.label} ${effectText}`.trim(),
      dropData.textColor ?? '#f8f3e6',
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
    this.collectRemainingDrops();
    this.audioSystem?.playPhaseClear();
    this.publishSharedState('Transicao');

    if (this.player?.body) {
      this.player.body.setVelocity(0, 0);
    }

    const isFinal = this.startPhase >= TOTAL_PHASES;

    // Salva com a fase seguinte para que o próximo load comece no lugar certo
    try {
      const saveData = serializeScene(this);
      saveData.phase = isFinal ? 1 : this.startPhase + 1;
      saveData.restoreFullHealth = true;

      if (saveData.player?.stats) {
        saveData.player.stats.health = saveData.player.stats.maxHealth;
      }

      writeToStorage(saveData);
    } catch {
      // Falha silenciosa; o save manual ainda está disponível
    }

    this.time.delayedCall(700, () => {
      this.scene.pause();
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
    const weaponName = this.weaponSystem?.equipped?.displayName ?? 'Common Sword';
    const activeEnemies = this.enemies?.countActive(true) ?? 0;
    const skillSnapshot = this.skillSystem?.getStatusSnapshot(this.time.now) ?? {
      fireball: '--',
      lightning: '--',
      aura: '--',
      auraActive: 'OFF',
    };

    this.inventoryText.setText(
      [
        `Loot HP:${this.inventory.health} ATQ:${this.inventory.strength} VEL:${this.inventory.speed}`,
        `Arma ${weaponName}`,
        `ATQ:${attackTotal} DEF:${this.player.stats.defense} MOV:${Math.round(speedTotal)}`,
        `Inim ${activeEnemies}/${this.initialEnemyCount}  Clima ${this.weatherSystem?.getLabel() ?? 'Dia'}`,
        `1:${skillSnapshot.fireball}  2:${skillSnapshot.lightning}  3:${skillSnapshot.aura}`,
        `Aura ${skillSnapshot.auraActive}`,
      ].join('\n'),
    );
  }

  getCurrentStatusLabel() {
    if (this.pauseSystem?.isPaused()) return 'Pausado';
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
    const skillSnapshot = this.skillSystem?.getStatusSnapshot(this.time.now) ?? {
      fireball: 'OK',
      lightning: 'OK',
      aura: 'OK',
      auraActive: 'OFF',
    };

    const activeEnemies = this.enemies?.countActive(true) ?? 0;
    const snapshot = {
      playerName: this.playerName,
      phase: this.startPhase,
      hp: this.player.stats.health,
      maxHp: this.player.stats.maxHealth,
      status: statusLabel,
      paused: this.pauseSystem?.isPaused() ?? false,
      enemyCount: activeEnemies,
      enemyTotal: this.initialEnemyCount,
      weatherLabel: this.weatherSystem?.getLabel() ?? 'Dia',
      weaponLabel: this.weaponSystem?.getWeaponLabel() ?? 'Common Sword [melee]',
      skills: skillSnapshot,
      inventory: {
        health: this.inventory.health,
        strength: this.inventory.strength,
        speed: this.inventory.speed,
      },
    };

    this.stateStore?.patch(snapshot);
    this.socketSync?.publishLocalState(snapshot);
    this.audioSystem?.update({ statusLabel });

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
      skill1: Boolean(payload?.skill1),
      skill2: Boolean(payload?.skill2),
      skill3: Boolean(payload?.skill3),
      shield: Boolean(payload?.shield),
    };

    if (!this.mobileInput.attack && next.attack) {
      this.mobileAttackQueued = true;
    }

    if (!this.mobileInput.skill1 && next.skill1) {
      this.mobileSkillQueued.fireball = true;
    }

    if (!this.mobileInput.skill2 && next.skill2) {
      this.mobileSkillQueued.lightning = true;
    }

    if (!this.mobileInput.skill3 && next.skill3) {
      this.mobileSkillQueued.aura = true;
    }

    if (!this.mobileInput.shield && next.shield) {
      this.mobileShieldQueued = true;
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
        this.scene.pause();
        this.scene.launch(OVERLAY_SCENE_KEY, { type: 'defeat', phase: this.startPhase });
      });
    }
  }

  restartCurrentPhase() {
    try {
      const saveData = serializeScene(this);
      saveData.phase = this.startPhase;
      saveData.restoreFullHealth = true;

      if (saveData.player?.stats) {
        saveData.player.stats.health = saveData.player.stats.maxHealth;
      }

      if (saveData.player) {
        saveData.player.x = this.spawnPoint.x;
        saveData.player.y = this.spawnPoint.y;
      }

      writeToStorage(saveData);
    } catch {
      // Falha silenciosa; ainda tentaremos reiniciar a cena
    }

    this.scene.restart({ phase: this.startPhase });
  }

  restartGame() {
    try {
      localStorage.removeItem('8bitlegends_save');
      localStorage.removeItem('8bl_autostart');
      localStorage.removeItem('8bl_player_name');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('8bl_restore_full_hp');
      }
    } catch {
      // noop
    }

    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
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
    const shouldRestoreFullHealth =
      data?.restoreFullHealth === true ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('8bl_restore_full_hp') === '1');

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

    if (data.weapon?.id && this.weaponSystem) {
      this.weaponSystem.equipWeapon(data.weapon.id, data.weapon.rarity, { silent: true });
    }

    const maxHp = safeNum(data.player.stats.maxHealth, 1, 9999);
    this.player.stats.maxHealth = maxHp;
    this.player.stats.health = shouldRestoreFullHealth
      ? maxHp
      : safeNum(data.player.stats.health, 1, maxHp);
    this.player.stats.attack = safeNum(data.player.stats.attack, 0, 999);
    this.player.stats.defense = safeNum(data.player.stats.defense, 0, 999);
    this.player.stats.bonusAttack = safeNum(data.player.stats.bonusAttack, 0, 999);
    this.player.stats.bonusSpeed = safeNum(data.player.stats.bonusSpeed, 0, 999);

    if (data.mapId === this.currentMapId) {
      this.player.x = safeNum(data.player.x, 0, this.worldSize.width);
      this.player.y = safeNum(data.player.y, 0, this.worldSize.height);
    }
    this.facing = VALID_FACINGS.includes(data.player.facing) ? data.player.facing : 'down';

    this.inventory.health = safeNum(data.inventory.health, 0, 9999);
    this.inventory.strength = safeNum(data.inventory.strength, 0, 9999);
    this.inventory.speed = safeNum(data.inventory.speed, 0, 9999);

    if (shouldRestoreFullHealth) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('8bl_restore_full_hp');
        }

        writeToStorage({
          ...data,
          restoreFullHealth: false,
          player: {
            ...data.player,
            stats: {
              ...data.player.stats,
              maxHealth: maxHp,
              health: maxHp,
            },
          },
        });
      } catch {
        // Falha silenciosa ao limpar a flag de restauração
      }
    }

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
    this.updateResponsiveCamera(width, height);
  }

  updateResponsiveCamera(width = this.scale.width, height = this.scale.height) {
    if (!this.cameras?.main) {
      return;
    }

    const compactSize = Math.min(width, height);
    const baseZoom = this.deviceProfile?.preferredZoom ?? 1.08;
    const zoom = compactSize < 460 ? 0.82 : compactSize < 720 ? 0.92 : baseZoom;
    this.cameras.main.setZoom(Phaser.Math.Clamp(zoom, 0.78, 1.15));
  }
}

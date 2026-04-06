// ─── Constantes ─────────────────────────────────────────────────────────────

const BOSS_PATROL_SPEED = 85;
const BOSS_CHASE_SPEED = 145;
const BOSS_CHARGE_SPEED = 290;
const BOSS_DETECT_RADIUS = 240;

/** Intervalo entre cargas (ms) */
const CHARGE_COOLDOWN = 3500;
/** Duração de uma carga (ms) */
const CHARGE_DURATION = 850;
/** Intervalo entre stomps (ms) */
const STOMP_COOLDOWN = 5500;
/** Duração do stomp (ms) */
const STOMP_DURATION = 650;

// ─── Comportamentos ──────────────────────────────────────────────────────────

/**
 * Máquina de estados do boss.
 *
 * Modos:
 * - 'chase'  : persegue o player a velocidade média
 * - 'charge' : dispara em linha reta a alta velocidade (tint amarelo)
 * - 'stomp'  : para no lugar, vibra a câmera e causa dano por área (tint vermelho vivo)
 * - 'patrol' : patrulha aleatória quando o player está muito longe
 */
export const updateBossBehavior = (boss, player, now, scene) => {
  if (!boss.active || !boss.body) return;

  const dx = player.x - boss.x;
  const dy = player.y - boss.y;
  const dist = Math.hypot(dx, dy);

  // ── Finalizar carga ───────────────────────────────────────────────────────
  if (boss.ai.bossMode === 'charge') {
    if (now < boss.ai.chargeEndAt) return; // mantém velocidade definida no início
    boss.ai.bossMode = 'chase';
    boss.setTint(0xaa1111);
    boss.ai.nextChargeAt = now + CHARGE_COOLDOWN;
  }

  // ── Finalizar stomp ───────────────────────────────────────────────────────
  if (boss.ai.bossMode === 'stomp') {
    boss.body.setVelocity(0, 0);

    if (now < boss.ai.stompEndAt) return;

    boss.ai.bossMode = 'chase';
    boss.setTint(0xaa1111);
    boss.ai.nextStompAt = now + STOMP_COOLDOWN;
    return;
  }

  // ── Entrar em stomp (muito perto do player) ────────────────────────────────
  if (dist < 90 && now > boss.ai.nextStompAt) {
    boss.ai.bossMode = 'stomp';
    boss.ai.stompEndAt = now + STOMP_DURATION;
    boss.setTint(0xff3333);
    scene.cameras.main.shake(240, 0.009);
    return;
  }

  // ── Entrar em carga (alcance médio) ───────────────────────────────────────
  if (dist < BOSS_DETECT_RADIUS && now > boss.ai.nextChargeAt) {
    boss.ai.bossMode = 'charge';
    boss.ai.chargeEndAt = now + CHARGE_DURATION;
    boss.setTint(0xffcc22);
    const dirX = dist > 0 ? dx / dist : 0;
    const dirY = dist > 0 ? dy / dist : 0;
    boss.body.setVelocity(dirX * BOSS_CHARGE_SPEED, dirY * BOSS_CHARGE_SPEED);
    return;
  }

  // ── Chase ou patrol ────────────────────────────────────────────────────────
  if (dist < BOSS_DETECT_RADIUS) {
    const dirX = dist > 0 ? dx / dist : 0;
    const dirY = dist > 0 ? dy / dist : 0;
    boss.body.setVelocity(dirX * BOSS_CHASE_SPEED, dirY * BOSS_CHASE_SPEED);
  } else {
    if (now >= boss.ai.nextDirectionChangeAt) {
      const dirs = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
      ];
      boss.ai.direction = dirs[Math.floor(Math.random() * dirs.length)];
      boss.ai.nextDirectionChangeAt = now + 900 + Math.random() * 900;
    }
    boss.body.setVelocity(
      boss.ai.direction.x * BOSS_PATROL_SPEED,
      boss.ai.direction.y * BOSS_PATROL_SPEED,
    );
  }
};

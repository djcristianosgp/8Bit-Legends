const cloneHudState = (state) => ({
  playerName: state.playerName,
  phase: state.phase,
  hp: state.hp,
  maxHp: state.maxHp,
  status: state.status,
  weaponLabel: state.weaponLabel,
  skills: {
    fireball: state.skills.fireball,
    lightning: state.skills.lightning,
    aura: state.skills.aura,
    auraActive: state.skills.auraActive,
  },
  inventory: {
    health: state.inventory.health,
    strength: state.inventory.strength,
    speed: state.inventory.speed,
  },
});

/**
 * Store de estado do jogo separado da cena/render.
 * Base para multiplayer: permite observadores e serialização controlada.
 */
export const createGameStateStore = (initialState) => {
  let current = {
    playerName: initialState?.playerName ?? 'Heroi',
    phase: initialState?.phase ?? 1,
    hp: initialState?.hp ?? 100,
    maxHp: initialState?.maxHp ?? 100,
    status: initialState?.status ?? 'Explorando',
    weaponLabel: initialState?.weaponLabel ?? 'Common Sword [melee]',
    skills: {
      fireball: initialState?.skills?.fireball ?? 'OK',
      lightning: initialState?.skills?.lightning ?? 'OK',
      aura: initialState?.skills?.aura ?? 'OK',
      auraActive: initialState?.skills?.auraActive ?? 'OFF',
    },
    inventory: {
      health: initialState?.inventory?.health ?? 0,
      strength: initialState?.inventory?.strength ?? 0,
      speed: initialState?.inventory?.speed ?? 0,
    },
  };

  const listeners = new Set();

  const notify = () => {
    const snap = cloneHudState(current);
    listeners.forEach((cb) => cb(snap));
  };

  return {
    getSnapshot() {
      return cloneHudState(current);
    },

    patch(patchData) {
      current = {
        ...current,
        ...patchData,
        skills: {
          ...current.skills,
          ...(patchData.skills ?? {}),
        },
        inventory: {
          ...current.inventory,
          ...(patchData.inventory ?? {}),
        },
      };
      notify();
    },

    subscribe(cb) {
      listeners.add(cb);
      cb(cloneHudState(current));
      return () => listeners.delete(cb);
    },
  };
};

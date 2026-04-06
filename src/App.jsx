import { useCallback, useEffect, useRef, useState } from 'react';
import { createGame } from './game/createGame';
import { importFromFile } from './game/save/saveStorage';

function App() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const saveBridgeRef = useRef(null);
  const stateStoreRef = useRef(null);
  const socketSyncRef = useRef(null);
  const fileInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const [started, setStarted] = useState(() => localStorage.getItem('8bl_autostart') === '1');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('8bl_player_name') ?? 'Heroi');
  const [toast, setToast] = useState(null);
  const [hud, setHud] = useState({
    playerName: 'Heroi',
    phase: 1,
    hp: 100,
    maxHp: 100,
    status: 'Aguardando inicio',
    weaponLabel: 'Common Sword [melee]',
    skills: { fireball: 'OK', lightning: 'OK', aura: 'OK', auraActive: 'OFF' },
    inventory: { health: 0, strength: 0, speed: 0 },
  });
  const [mobileInput, setMobileInput] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  });

  const showToast = useCallback((msg, ok = true) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ msg, ok });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2400);
  }, []);

  useEffect(() => {
    if (!started || !containerRef.current) {
      return undefined;
    }

    const normalizedName = playerName.trim() || 'Heroi';
    localStorage.setItem('8bl_player_name', normalizedName);

    const { game, saveBridge, stateStore, socketSync } = createGame(containerRef.current, {
      playerName: normalizedName,
    });

    gameRef.current = game;
    saveBridgeRef.current = saveBridge;
    stateStoreRef.current = stateStore;
    socketSyncRef.current = socketSync;

    const unsub = stateStore.subscribe((snapshot) => {
      setHud(snapshot);
    });

    // Base multiplayer: conexão opcional, não bloqueia offline.
    socketSync.connect();

    return () => {
      unsub();
      socketSync.disconnect();
      saveBridge.destroy();
      game.destroy(true);

      gameRef.current = null;
      saveBridgeRef.current = null;
      stateStoreRef.current = null;
      socketSyncRef.current = null;
    };
  }, [started, playerName]);

  useEffect(() => {
    if (!started || !gameRef.current) {
      return;
    }

    gameRef.current.events.emit('mobile-input', mobileInput);
  }, [mobileInput, started]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const setMobileControl = (key, pressed) => {
    setMobileInput((prev) => ({ ...prev, [key]: pressed }));
  };

  const startGame = () => {
    localStorage.setItem('8bl_autostart', '1');
    setStarted(true);
  };

  const hpPercent = Math.round((hud.hp / Math.max(1, hud.maxHp)) * 100);

  const handleSave = () => {
    const ok = saveBridgeRef.current?.save();
    showToast(ok ? 'Progresso salvo!' : 'Nada para salvar.', Boolean(ok));
  };

  const handleExport = () => {
    saveBridgeRef.current?.exportJson();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    e.target.value = '';

    try {
      const data = await importFromFile(file);
      saveBridgeRef.current?.importJson(data);
      showToast('Save importado com sucesso!', true);
    } catch (err) {
      showToast(err.message ?? 'Erro ao importar save.', false);
    }
  };

  return (
    <main className="app-shell">
      <header className="game-header">
        <h1>8Bit Legends</h1>
        <p>Mova com setas/WASD &middot; Ataque: ESPACO (ou botao no mobile)</p>
      </header>

      {!started && (
        <section className="start-screen" aria-label="Tela inicial">
          <div className="start-card">
            <h2>Iniciar Jornada</h2>
            <p>Digite seu nome para começar sua aventura em 8Bit Legends.</p>

            <label htmlFor="player-name">Nome do jogador</label>
            <input
              id="player-name"
              type="text"
              maxLength={18}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ex: Aria, Darius, Luna"
            />

            <button type="button" className="start-btn" onClick={startGame}>
              Iniciar
            </button>
          </div>
        </section>
      )}

      {started && (
        <section className="hud-panel" aria-label="HUD externo">
          <div className="hud-main">
            <strong className="hud-name">{hud.playerName}</strong>
            <span className="hud-chip">Fase {hud.phase}</span>
            <span className="hud-chip">Status: {hud.status}</span>
            <span className="hud-chip">⚔ {hud.weaponLabel}</span>
          </div>
          <div className="hud-life" aria-label="Vida do jogador">
            <span>Vida {hud.hp}/{hud.maxHp}</span>
            <div className="hud-life-bar">
              <div className="hud-life-fill" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>
          <div className="hud-skill-row" aria-label="Skills e cooldowns">
            <span className={`hud-skill ${hud.skills.fireball === 'OK' ? 'hud-skill--ready' : 'hud-skill--cooldown'}`}>
              1 Fireball {hud.skills.fireball}
            </span>
            <span className={`hud-skill ${hud.skills.lightning === 'OK' ? 'hud-skill--ready' : 'hud-skill--cooldown'}`}>
              2 Lightning {hud.skills.lightning}
            </span>
            <span className={`hud-skill ${hud.skills.aura === 'OK' ? 'hud-skill--ready' : 'hud-skill--cooldown'}`}>
              3 Aura {hud.skills.aura}
            </span>
            <span className="hud-skill">Aura ativa: {hud.skills.auraActive}</span>
          </div>
        </section>
      )}

      <section className="game-wrapper">
        <div ref={containerRef} className="game-container" />
      </section>

      {started && (
        <section className="mobile-controls" aria-label="Controles mobile">
          <div className="mobile-pad">
            <button
              type="button"
              onPointerDown={() => setMobileControl('up', true)}
              onPointerUp={() => setMobileControl('up', false)}
              onPointerLeave={() => setMobileControl('up', false)}
              onPointerCancel={() => setMobileControl('up', false)}
            >
              ▲
            </button>
            <button
              type="button"
              onPointerDown={() => setMobileControl('left', true)}
              onPointerUp={() => setMobileControl('left', false)}
              onPointerLeave={() => setMobileControl('left', false)}
              onPointerCancel={() => setMobileControl('left', false)}
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={() => setMobileControl('down', true)}
              onPointerUp={() => setMobileControl('down', false)}
              onPointerLeave={() => setMobileControl('down', false)}
              onPointerCancel={() => setMobileControl('down', false)}
            >
              ▼
            </button>
            <button
              type="button"
              onPointerDown={() => setMobileControl('right', true)}
              onPointerUp={() => setMobileControl('right', false)}
              onPointerLeave={() => setMobileControl('right', false)}
              onPointerCancel={() => setMobileControl('right', false)}
            >
              ▶
            </button>
          </div>
          <button
            className="mobile-attack"
            type="button"
            onPointerDown={() => setMobileControl('attack', true)}
            onPointerUp={() => setMobileControl('attack', false)}
            onPointerLeave={() => setMobileControl('attack', false)}
            onPointerCancel={() => setMobileControl('attack', false)}
          >
            ATAQUE
          </button>
        </section>
      )}

      <footer className="save-controls">
        {toast && (
          <span className={`save-toast ${toast.ok ? 'save-toast--ok' : 'save-toast--err'}`}>
            {toast.msg}
          </span>
        )}
        <button className="save-btn" type="button" onClick={handleSave}>
          Salvar
        </button>
        <button className="save-btn" type="button" onClick={handleExport}>
          Exportar JSON
        </button>
        <button className="save-btn" type="button" onClick={handleImportClick}>
          Importar JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </footer>
    </main>
  );
}

export default App;

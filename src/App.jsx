import { useCallback, useEffect, useRef, useState } from 'react';
import { createGame } from './game/createGame';
import { importFromFile } from './game/save/saveStorage';

const MOBILE_QUERY = '(max-width: 900px), (pointer: coarse)';
const DEFAULT_MOBILE_INPUT = {
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

function App() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const saveBridgeRef = useRef(null);
  const stateStoreRef = useRef(null);
  const socketSyncRef = useRef(null);
  const fileInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const touchGestureRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
  });

  const [started, setStarted] = useState(() => localStorage.getItem('8bl_autostart') === '1');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('8bl_player_name') ?? 'Heroi');
  const [toast, setToast] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showUtilityPanel, setShowUtilityPanel] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(
    () => localStorage.getItem('8bl_touch_controls') !== '0',
  );
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }

    return window.matchMedia(MOBILE_QUERY).matches;
  });
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }

    return window.matchMedia('(display-mode: standalone)').matches;
  });
  const [hud, setHud] = useState({
    playerName: 'Heroi',
    phase: 1,
    hp: 100,
    maxHp: 100,
    status: 'Aguardando inicio',
    paused: false,
    enemyCount: 0,
    enemyTotal: 0,
    weatherLabel: 'Dia',
    weaponLabel: 'Common Sword [melee]',
    skills: { fireball: 'OK', lightning: 'OK', aura: 'OK', auraActive: 'OFF' },
    inventory: { health: 0, strength: 0, speed: 0 },
  });
  const [mobileInput, setMobileInput] = useState(DEFAULT_MOBILE_INPUT);

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

  const pulseHaptics = useCallback((duration = 12) => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const viewportQuery = window.matchMedia(MOBILE_QUERY);
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const syncViewportState = () => {
      setIsMobileViewport(viewportQuery.matches);
      setIsStandalone(standaloneQuery.matches);
    };

    syncViewportState();
    viewportQuery.addEventListener?.('change', syncViewportState);
    standaloneQuery.addEventListener?.('change', syncViewportState);

    return () => {
      viewportQuery.removeEventListener?.('change', syncViewportState);
      standaloneQuery.removeEventListener?.('change', syncViewportState);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('8bl_touch_controls', showTouchControls ? '1' : '0');
  }, [showTouchControls]);

  useEffect(() => {
    if (!isMobileViewport || !started) {
      setShowUtilityPanel(false);
    }
  }, [isMobileViewport, started]);

  useEffect(() => {
    const onPwaStatus = (event) => {
      if (event.detail === 'offline-ready') {
        showToast('Modo offline pronto para a próxima sessão!', true);
      }

      if (event.detail === 'update-ready') {
        showToast('Nova versão detectada. Atualizando...', true);
      }
    };

    window.addEventListener('pwa-status', onPwaStatus);
    return () => window.removeEventListener('pwa-status', onPwaStatus);
  }, [showToast]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
      showToast('8Bit Legends instalado com sucesso!', true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [showToast]);

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
    if (!started) {
      return undefined;
    }

    const persistAndPause = () => {
      touchGestureRef.current = {
        active: false,
        pointerId: null,
        startX: 0,
        startY: 0,
      };
      clearTouchMovement();
      saveBridgeRef.current?.save();
      gameRef.current?.events.emit('force-pause');
      gameRef.current?.loop?.sleep?.();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistAndPause();
        return;
      }

      gameRef.current?.loop?.wake?.();
    };

    const handlePageHide = () => {
      saveBridgeRef.current?.save();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [started]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const setMobileControl = useCallback((key, pressed) => {
    setMobileInput((prev) => {
      if (prev[key] === pressed) {
        return prev;
      }

      return { ...prev, [key]: pressed };
    });

    if (pressed && ['attack', 'skill1', 'skill2', 'skill3', 'shield'].includes(key)) {
      pulseHaptics(14);
    }
  }, [pulseHaptics]);

  const clearTouchMovement = useCallback(() => {
    setMobileInput((prev) => {
      if (!prev.up && !prev.down && !prev.left && !prev.right) {
        return prev;
      }

      return {
        ...prev,
        up: false,
        down: false,
        left: false,
        right: false,
      };
    });
  }, []);

  const updateTouchMovement = useCallback((deltaX, deltaY) => {
    const threshold = 14;

    setMobileInput((prev) => {
      const next = {
        ...prev,
        left: deltaX < -threshold,
        right: deltaX > threshold,
        up: deltaY < -threshold,
        down: deltaY > threshold,
      };

      if (
        next.up === prev.up &&
        next.down === prev.down &&
        next.left === prev.left &&
        next.right === prev.right
      ) {
        return prev;
      }

      return next;
    });
  }, []);

  const handleGameTouchStart = useCallback((event) => {
    if (!started || !isMobileViewport) {
      return;
    }

    event.preventDefault();
    touchGestureRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [isMobileViewport, started]);

  const handleGameTouchMove = useCallback((event) => {
    const gesture = touchGestureRef.current;
    if (!gesture.active || gesture.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    updateTouchMovement(event.clientX - gesture.startX, event.clientY - gesture.startY);
  }, [updateTouchMovement]);

  const handleGameTouchEnd = useCallback((event) => {
    const gesture = touchGestureRef.current;
    if (!gesture.active) {
      return;
    }

    if (event?.pointerId != null && gesture.pointerId !== event.pointerId) {
      return;
    }

    event?.currentTarget?.releasePointerCapture?.(event.pointerId);
    touchGestureRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
    };
    clearTouchMovement();
  }, [clearTouchMovement]);

  const getControlBindings = (key) => ({
    onPointerDown: () => setMobileControl(key, true),
    onPointerUp: () => setMobileControl(key, false),
    onPointerLeave: () => setMobileControl(key, false),
    onPointerCancel: () => setMobileControl(key, false),
    onContextMenu: (event) => event.preventDefault(),
  });

  const startGame = () => {
    localStorage.setItem('8bl_autostart', '1');
    setStarted(true);
  };

  const handlePauseToggle = () => {
    gameRef.current?.events.emit('toggle-pause');
  };

  const handleInstallApp = async () => {
    if (!installPrompt) {
      showToast('Abra pelo navegador do celular para instalar o app.', false);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice?.outcome === 'accepted') {
      showToast('Instalação iniciada!', true);
    }

    setInstallPrompt(null);
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

  const isCompactMobileLayout = started && isMobileViewport;
  const shouldShowTouchControls = isCompactMobileLayout && showTouchControls;

  return (
    <main className={`app-shell ${isCompactMobileLayout ? 'app-shell--mobile-compact' : ''}`}>
      <header className={`game-header ${isCompactMobileLayout ? 'game-header--compact' : ''}`}>
        <div>
          <h1>8Bit Legends</h1>
          <p>
            {isCompactMobileLayout
              ? 'Arraste para mover e use os botões de ação.'
              : isMobileViewport
                ? 'Arraste o dedo na área do jogo para mover e use os botões para atacar, skills e pausar.'
                : 'Mova com setas/WASD · Ataque: ESPAÇO · Skills: 1/2/3 · Escudo: SHIFT · Pausa: ESC'}
          </p>
        </div>
        <div className="header-actions">
          {!isCompactMobileLayout && isMobileViewport && started && (
            <button
              className="save-btn header-action-btn"
              type="button"
              onClick={() => setShowTouchControls((prev) => !prev)}
            >
              {showTouchControls ? 'Ocultar touch' : 'Mostrar touch'}
            </button>
          )}
          {installPrompt && !isStandalone && !isCompactMobileLayout && (
            <button className="save-btn header-action-btn" type="button" onClick={handleInstallApp}>
              📲 Instalar app
            </button>
          )}
        </div>
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
        <section className={`hud-panel ${isCompactMobileLayout ? 'hud-panel--compact' : ''}`} aria-label="HUD externo">
          <div className={`hud-main ${isCompactMobileLayout ? 'hud-main--compact' : ''}`}>
            <strong className="hud-name">{hud.playerName}</strong>
            <span className="hud-chip">{isCompactMobileLayout ? `F${hud.phase}` : `Fase ${hud.phase}`}</span>
            <span className={`hud-chip ${hud.enemyCount <= 3 && hud.enemyTotal > 0 ? 'hud-chip--warn' : ''}`}>
              👾 {hud.enemyCount}/{hud.enemyTotal || hud.enemyCount}
            </span>
            <span className="hud-chip">{isCompactMobileLayout ? `☁ ${hud.weatherLabel}` : `Clima: ${hud.weatherLabel}`}</span>
            <span className={`hud-chip ${hud.paused ? 'hud-chip--pause' : ''}`}>
              {isCompactMobileLayout ? `${hud.paused ? '⏸' : '▶'} ${hud.status}` : `Status: ${hud.status}`}
            </span>
            {!isCompactMobileLayout && <span className="hud-chip">⚔ {hud.weaponLabel}</span>}
            {isStandalone && !isCompactMobileLayout && <span className="hud-chip">App instalado</span>}
          </div>
          <div className="hud-life" aria-label="Vida do jogador">
            <span>{isCompactMobileLayout ? `HP ${hud.hp}/${hud.maxHp}` : `Vida ${hud.hp}/${hud.maxHp}`}</span>
            <div className="hud-life-bar">
              <div className="hud-life-fill" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>
          <div className={`hud-skill-row ${isCompactMobileLayout ? 'hud-skill-row--compact' : ''}`} aria-label="Skills e cooldowns">
            <span className={`hud-skill ${hud.skills.fireball === 'OK' ? 'hud-skill--ready' : 'hud-skill--cooldown'}`}>
              {isCompactMobileLayout ? `1 ${hud.skills.fireball}` : `1 Fireball ${hud.skills.fireball}`}
            </span>
            <span className={`hud-skill ${hud.skills.lightning === 'OK' ? 'hud-skill--ready' : 'hud-skill--cooldown'}`}>
              {isCompactMobileLayout ? `2 ${hud.skills.lightning}` : `2 Lightning ${hud.skills.lightning}`}
            </span>
            <span className={`hud-skill ${hud.skills.aura === 'OK' ? 'hud-skill--ready' : 'hud-skill--cooldown'}`}>
              {isCompactMobileLayout ? `3 ${hud.skills.aura}` : `3 Aura ${hud.skills.aura}`}
            </span>
            <span className="hud-skill">{isCompactMobileLayout ? `Aura ${hud.skills.auraActive}` : `Aura ativa: ${hud.skills.auraActive}`}</span>
          </div>
          <div className={`hud-actions ${isCompactMobileLayout ? 'hud-actions--compact' : ''}`}>
            <button className="save-btn hud-action-btn" type="button" onClick={handlePauseToggle}>
              {hud.paused ? '▶ Continuar' : '⏸ Pausar'}
            </button>
            {isCompactMobileLayout && (
              <button className="save-btn hud-action-btn" type="button" onClick={handleSave}>
                💾 Salvar
              </button>
            )}
          </div>
        </section>
      )}

      <section className={`game-wrapper ${isMobileViewport ? 'game-wrapper--mobile' : ''}`}>
        <div
          ref={containerRef}
          className={`game-container ${isMobileViewport ? 'game-container--touch' : ''}`}
          aria-label={isMobileViewport ? 'Área do jogo com movimento por toque' : 'Área do jogo'}
          onPointerDown={handleGameTouchStart}
          onPointerMove={handleGameTouchMove}
          onPointerUp={handleGameTouchEnd}
          onPointerCancel={handleGameTouchEnd}
          onLostPointerCapture={handleGameTouchEnd}
        />
      </section>

      {started && isMobileViewport && (
        <p className="touch-drag-hint">👆 Arraste o dedo sobre a área do jogo para movimentar o personagem.</p>
      )}

      {shouldShowTouchControls && (
        <section className="mobile-controls" aria-label="Controles mobile">
          <div className="mobile-controls__left">
            <span className="mobile-controls__label">Movimento</span>
            <div className="mobile-pad">
              <button
                className={`mobile-pad-btn ${mobileInput.up ? 'is-pressed' : ''}`}
                type="button"
                aria-label="Mover para cima"
                {...getControlBindings('up')}
              >
                ▲
              </button>
              <button
                className={`mobile-pad-btn ${mobileInput.left ? 'is-pressed' : ''}`}
                type="button"
                aria-label="Mover para a esquerda"
                {...getControlBindings('left')}
              >
                ◀
              </button>
              <button
                className={`mobile-pad-btn ${mobileInput.down ? 'is-pressed' : ''}`}
                type="button"
                aria-label="Mover para baixo"
                {...getControlBindings('down')}
              >
                ▼
              </button>
              <button
                className={`mobile-pad-btn ${mobileInput.right ? 'is-pressed' : ''}`}
                type="button"
                aria-label="Mover para a direita"
                {...getControlBindings('right')}
              >
                ▶
              </button>
            </div>
          </div>

          <div className="mobile-controls__right">
            <span className="mobile-controls__label">Ações</span>
            <div className="mobile-action-grid">
              <button
                className={`mobile-action mobile-action--attack ${mobileInput.attack ? 'is-pressed' : ''}`}
                type="button"
                {...getControlBindings('attack')}
              >
                ATQ
              </button>
              <button
                className={`mobile-action ${mobileInput.skill1 ? 'is-pressed' : ''}`}
                type="button"
                {...getControlBindings('skill1')}
              >
                1 🔥
              </button>
              <button
                className={`mobile-action ${mobileInput.skill2 ? 'is-pressed' : ''}`}
                type="button"
                {...getControlBindings('skill2')}
              >
                2 ⚡
              </button>
              <button
                className={`mobile-action ${mobileInput.skill3 ? 'is-pressed' : ''}`}
                type="button"
                {...getControlBindings('skill3')}
              >
                3 ✨
              </button>
              <button
                className={`mobile-action mobile-action--shield ${mobileInput.shield ? 'is-pressed' : ''}`}
                type="button"
                {...getControlBindings('shield')}
              >
                🛡 Escudo
              </button>
            </div>
          </div>
        </section>
      )}

      <footer className={`save-controls ${isCompactMobileLayout ? 'save-controls--compact' : ''}`}>
        {toast && (
          <span className={`save-toast ${toast.ok ? 'save-toast--ok' : 'save-toast--err'}`}>
            {toast.msg}
          </span>
        )}

        {isCompactMobileLayout ? (
          <>
            <button
              className="save-btn save-btn--compact-toggle"
              type="button"
              onClick={() => setShowUtilityPanel((prev) => !prev)}
            >
              {showUtilityPanel ? 'Fechar utilidades' : '☰ Mais opções'}
            </button>

            {showUtilityPanel && (
              <div className="mobile-utility-panel">
                <button className="save-btn" type="button" onClick={() => setShowTouchControls((prev) => !prev)}>
                  {showTouchControls ? 'Ocultar touch' : 'Mostrar touch'}
                </button>
                <button className="save-btn" type="button" onClick={handleExport}>
                  Exportar JSON
                </button>
                <button className="save-btn" type="button" onClick={handleImportClick}>
                  Importar JSON
                </button>
                {installPrompt && !isStandalone && (
                  <button className="save-btn" type="button" onClick={handleInstallApp}>
                    Instalar App
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <button className="save-btn" type="button" onClick={handleSave}>
              Salvar
            </button>
            <button className="save-btn" type="button" onClick={handleExport}>
              Exportar JSON
            </button>
            <button className="save-btn" type="button" onClick={handleImportClick}>
              Importar JSON
            </button>
            {installPrompt && !isStandalone && (
              <button className="save-btn" type="button" onClick={handleInstallApp}>
                Instalar App
              </button>
            )}
          </>
        )}

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

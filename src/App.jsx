import { useCallback, useEffect, useRef, useState } from 'react';
import { createGame } from './game/createGame';
import { importFromFile } from './game/save/saveStorage';

function App() {
  const containerRef = useRef(null);
  const saveBridgeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const { game, saveBridge } = createGame(containerRef.current);
    saveBridgeRef.current = saveBridge;

    return () => {
      saveBridge.destroy();
      game.destroy(true);
      saveBridgeRef.current = null;
    };
  }, []);

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
        <p>Mova com setas/WASD &middot; Ataque: ESPACO</p>
      </header>
      <section className="game-wrapper">
        <div ref={containerRef} className="game-container" />
      </section>
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

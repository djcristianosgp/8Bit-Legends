import { useEffect, useRef } from 'react';
import { createGame } from './game/createGame';

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const game = createGame(containerRef.current);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="game-header">
        <h1>8Bit Legends</h1>
        <p>Mova o heroi com as setas ou WASD.</p>
      </header>
      <section className="game-wrapper">
        <div ref={containerRef} className="game-container" />
      </section>
    </main>
  );
}

export default App;

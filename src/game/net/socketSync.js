const DEFAULT_URL = 'ws://localhost:8080/8bit-legends';

/**
 * Base de sincronização futura via WebSocket.
 * Neste estágio, a conexão é opcional e segura: se não houver servidor,
 * o jogo continua funcionando normalmente em modo local.
 */
export const createSocketSync = ({ stateStore, url = DEFAULT_URL }) => {
  let socket = null;
  let connected = false;

  const isSupported = () => typeof window !== 'undefined' && 'WebSocket' in window;

  const connect = () => {
    if (!isSupported() || socket) {
      return;
    }

    try {
      socket = new WebSocket(url);

      socket.addEventListener('open', () => {
        connected = true;
      });

      socket.addEventListener('close', () => {
        connected = false;
        socket = null;
      });

      socket.addEventListener('error', () => {
        connected = false;
      });

      socket.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.type === 'state.patch' && payload?.data) {
            stateStore.patch(payload.data);
          }
        } catch {
          // Ignora pacotes inválidos por segurança
        }
      });
    } catch {
      connected = false;
      socket = null;
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      socket = null;
    }
    connected = false;
  };

  const publishLocalState = (stateSnapshot) => {
    if (!socket || !connected || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'state.publish',
        data: stateSnapshot,
      }),
    );
  };

  return {
    connect,
    disconnect,
    publishLocalState,
    isConnected: () => connected,
  };
};

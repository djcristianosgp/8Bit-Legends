const PWA_STATUS_EVENT = 'pwa-status';

const emitStatus = (status) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(PWA_STATUS_EVENT, { detail: status }));
};

const applyWaitingUpdate = (registration) => {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};

export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !import.meta.env.PROD) {
    return;
  }

  let refreshing = false;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}service-worker.js`,
        { updateViaCache: 'none' },
      );

      if (registration.waiting) {
        emitStatus('update-ready');
        applyWaitingUpdate(registration);
      }

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) {
          return;
        }

        worker.addEventListener('statechange', () => {
          if (worker.state !== 'installed') {
            return;
          }

          if (navigator.serviceWorker.controller) {
            emitStatus('update-ready');
            applyWaitingUpdate(registration);
          } else {
            emitStatus('offline-ready');
          }
        });
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) {
          return;
        }

        refreshing = true;
        window.location.reload();
      });
    } catch (error) {
      console.warn('Falha ao registrar o service worker.', error);
    }
  });
};

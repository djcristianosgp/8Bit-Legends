import { isValidSave } from './saveSchema';
import { serializeScene } from './saveSerializer';
import { exportToFile, readFromStorage, writeToStorage } from './saveStorage';

export const createSaveBridge = (phaserGame) => {
  let activeScene = null;

  const onSceneReady = (scene) => {
    activeScene = scene;
    const saved = readFromStorage();

    if (isValidSave(saved)) {
      scene.applySave(saved);
    }
  };

  const onSaveTrigger = () => {
    if (activeScene?.player?.active) {
      writeToStorage(serializeScene(activeScene));
    }
  };

  phaserGame.events.on('scene-ready', onSceneReady);
  phaserGame.events.on('save-trigger', onSaveTrigger);

  const bridge = {
    save() {
      if (!activeScene?.player?.active) {
        return false;
      }

      return writeToStorage(serializeScene(activeScene));
    },

    exportJson() {
      if (!activeScene?.player?.active) {
        return;
      }

      exportToFile(serializeScene(activeScene));
    },

    importJson(rawData) {
      if (!isValidSave(rawData)) {
        throw new Error('Save invalido ou versao incompativel.');
      }

      writeToStorage(rawData);

      if (activeScene) {
        activeScene.applySave(rawData);
      }
    },

    hasActiveSave() {
      return isValidSave(readFromStorage());
    },

    destroy() {
      phaserGame.events.off('scene-ready', onSceneReady);
      phaserGame.events.off('save-trigger', onSaveTrigger);
      activeScene = null;
    },
  };

  return bridge;
};

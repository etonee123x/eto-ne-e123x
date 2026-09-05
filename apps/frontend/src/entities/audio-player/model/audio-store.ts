import { isNil } from '@/shared/utils/is-nil';
import type { AudioStore } from './audio-store-context';

export const DEFAULT_VOLUME = 1;

const localStorageVolume = (() => {
  const LOCAL_STORAGE_KEY = 'player:volume';

  return {
    get: () => {
      if (!('localStorage' in globalThis)) {
        return null;
      }

      const value = globalThis.localStorage.getItem(LOCAL_STORAGE_KEY);

      if (isNil(value) || Number.isNaN(Number(value))) {
        globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, String(DEFAULT_VOLUME));
        return DEFAULT_VOLUME;
      }

      return Number(value);
    },
    set: (volume: number) => {
      if ('localStorage' in globalThis) {
        globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, String(volume));
      }
    },
  };
})();

export interface InternalAudioStore extends AudioStore {
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (currentTime: number) => void;
  setVolume: (volume: number) => void;
  notify: () => void;
}

export const createAudioStore = (): InternalAudioStore => {
  const listeners = new Set<() => void>();
  const notify = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };
  const store: InternalAudioStore = {
    currentTime: 0,
    volume: localStorageVolume.get() ?? DEFAULT_VOLUME,
    isPlaying: false,
    setCurrentTime: (currentTime) => {
      store.currentTime = currentTime;
      notify();
    },
    setVolume: (volume) => {
      store.volume = volume;
      localStorageVolume.set(volume);
      notify();
    },
    setIsPlaying: (isPlaying) => {
      store.isPlaying = isPlaying;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        return listeners.delete(listener);
      };
    },
    notify,
  };

  return store;
};

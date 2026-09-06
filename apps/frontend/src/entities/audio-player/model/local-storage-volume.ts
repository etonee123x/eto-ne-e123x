import { isNil } from '@/shared/utils/is-nil';

const LOCAL_STORAGE_KEY = 'player:volume';

export const DEFAULT_VOLUME = 1;

export const localStorageVolume = {
  get: () => {
    if (!('localStorage' in globalThis)) {
      return DEFAULT_VOLUME;
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

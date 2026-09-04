'use client';

import { throwError } from '@/shared/utils/throw-error';
import { createContext, useContext, useSyncExternalStore } from 'react';

export interface AudioStore {
  currentTime: number;
  volume: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  setCurrentTime: (currentTime: number) => void;
  setVolume: (volume: number) => void;
  setAudioElement: (audioElement: HTMLAudioElement | null) => void;
  subscribe: (listener: () => void) => () => void;
}

export const AudioStoreContext = createContext<AudioStore | null>(null);

const useAudioStore = () => {
  return useContext(AudioStoreContext) ?? throwError();
};

export const useAudio = () => {
  const { play, pause, setCurrentTime, setVolume } = useAudioStore();

  return { play, pause, setCurrentTime, setVolume };
};

export const useAudioCurrentTime = () => {
  const store = useAudioStore();

  return useSyncExternalStore(
    store.subscribe,
    () => {
      return store.currentTime;
    },
    () => {
      return 0;
    },
  );
};

export const useAudioVolume = () => {
  const store = useAudioStore();

  return useSyncExternalStore(
    store.subscribe,
    () => {
      return store.volume;
    },
    () => {
      return 1;
    },
  );
};

export const useAudioIsPlaying = () => {
  const store = useAudioStore();

  return useSyncExternalStore(
    store.subscribe,
    () => {
      return store.isPlaying;
    },
    () => {
      return false;
    },
  );
};

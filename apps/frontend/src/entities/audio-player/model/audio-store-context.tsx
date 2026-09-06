'use client';

import { throwError } from '@/shared/utils/throw-error';
import { createContext, useContext, useSyncExternalStore, type RefObject } from 'react';
import type { AudioStore } from './audio-store';

export const AudioStoreContext = createContext<RefObject<AudioStore> | null>(null);

const useAudioStore = () => {
  return useContext(AudioStoreContext) ?? throwError();
};

export const useAudioCurrentTime = () => {
  const audioStore = useAudioStore();

  const currentTime = useSyncExternalStore(
    audioStore.current.subscribeCurrentTime,
    audioStore.current.getSnapshotCurrentTime,
    audioStore.current.getServerSnapshotCurrentTime,
  );

  const setCurrentTime = (currentTime: number) => {
    audioStore.current.setCurrentTime(currentTime);
  };

  return [currentTime, setCurrentTime] as const;
};

export const useAudioVolume = () => {
  const audioStore = useAudioStore();

  const volume = useSyncExternalStore(
    audioStore.current.subscribeVolume,
    audioStore.current.getSnapshotVolume,
    audioStore.current.getServerSnapshotVolume,
  );

  const setVolume = (volume: number) => {
    audioStore.current.setVolume(volume);
  };

  return [volume, setVolume] as const;
};

export const useAudioIsPlaying = () => {
  const audioStore = useAudioStore();

  const isPlaying = useSyncExternalStore(
    audioStore.current.subscribeIsPlaying,
    audioStore.current.getSnapshotIsPlaying,
    audioStore.current.getServerSnapshotIsPlaying,
  );

  const play = () => {
    audioStore.current.play();
  };

  const pause = () => {
    audioStore.current.pause();
  };

  return [isPlaying, { play, pause }] as const;
};

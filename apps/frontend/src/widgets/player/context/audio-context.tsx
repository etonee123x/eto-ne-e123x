'use client';

import { throwError } from '@/shared/utils/throw-error';
import { createContext, useContext } from 'react';

export const AudioContext = createContext<{
  play: () => void;
  pause: () => void;
  isPlaying: boolean;

  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
} | null>(null);

export const useAudioContext = () => {
  return useContext(AudioContext) ?? throwError();
};

'use client';

import { throwError } from '@/shared/utils/throw-error';
import { createContext, useContext } from 'react';

export interface AudioController {
  play: () => void;
  pause: () => void;
  setCurrentTime: (currentTime: number) => void;
  setVolume: (volume: number) => void;
}

export const AudioControllerContext = createContext<AudioController | null>(null);

export const useAudioController = () => {
  return useContext(AudioControllerContext) ?? throwError();
};

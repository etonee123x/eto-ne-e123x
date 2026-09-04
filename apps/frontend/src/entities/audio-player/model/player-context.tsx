'use client';

import { throwError } from '@/shared/utils/throw-error';
import type { components } from '@/shared/api/openapi';
import { createContext, useContext } from 'react';

type Track = components['schemas']['FolderDataItemAudio'];

export const PlayerContext = createContext<{
  track: Track | null;
  open: (track: Track, playlist: Array<Track>, pathDirectory: string) => void;
  next: () => void;
  previous: () => void;
  close: () => void;
  isShuffleModeEnabled: boolean;
  setIsShuffleModeEnabled: (isShuffleModeEnabled: boolean) => void;
  setCurrentPlayingNumber: (playingNumber: number) => void;
  setPathDirectory: (pathDirectory: string | null) => void;
  hasHistoryItems: boolean;
} | null>(null);

export const useAudioPlayer = () => {
  return useContext(PlayerContext) ?? throwError();
};

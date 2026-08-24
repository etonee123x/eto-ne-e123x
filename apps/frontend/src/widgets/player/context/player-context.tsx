'use client';

import { throwError } from '@/shared/utils/throw-error';
import { createContext, type RefObject, useContext } from 'react';
import type { components } from '@/shared/api/openapi';

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

  audioRef: RefObject<HTMLAudioElement | null>;
} | null>(null);

export const usePlayerContext = () => {
  return useContext(PlayerContext) ?? throwError();
};

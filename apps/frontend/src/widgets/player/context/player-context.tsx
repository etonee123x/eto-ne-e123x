'use client';

import { throwError } from '@/shared/utils/throw-error';
import { createContext, type RefObject, useContext } from 'react';
import type { components } from '@/shared/api/openapi';

type Track = components['schemas']['FolderDataItemAudio'];

export const PlayerContext = createContext<{
  track: Track | null;
  playlist: Array<Track>;

  open: (track: Track, playlist: Array<Track>, pathDirectory: string) => void;
  close: () => void;

  setCurrentPlayingNumber: (playingNumber: number) => void;

  setPathDirectory: (pathDirectory: string | null) => void;

  audioRef: RefObject<HTMLAudioElement | null>;
} | null>(null);

export const usePlayerContext = () => {
  return useContext(PlayerContext) ?? throwError();
};

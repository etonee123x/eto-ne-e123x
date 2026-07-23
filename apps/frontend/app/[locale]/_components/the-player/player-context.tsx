'use client';

import { components } from '@/lib/types/openapi';
import { throwError } from '@/lib/utils/throw-error';
import { createContext, useContext } from 'react';

type Track = components['schemas']['FolderDataItemAudio'];

export const PlayerContext = createContext<{
  track: Track | null;
  setTrack: (track: Track | null) => void;
  playlist: Array<Track>;
  setPlaylist: (playlist: Array<Track>) => void;
  pathDirectory: string | null;
  setPathDirectory: (pathDirectory: string | null) => void;
} | null>(null);

export const usePlayerContext = () => {
  return useContext(PlayerContext) ?? throwError();
};

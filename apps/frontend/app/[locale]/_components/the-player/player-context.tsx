'use client';

import { components } from '@/lib/types/openapi';
import { throwError } from '@/lib/utils/throw-error';
import { createContext, Dispatch, SetStateAction, useContext } from 'react';

type Track = components['schemas']['FolderDataItemAudio'];

export const PlayerContext = createContext<{
  track: Track | null;
  setTrack: Dispatch<SetStateAction<Track | null>>;
  playlist: Array<Track>;
  setPlaylist: Dispatch<SetStateAction<Array<Track>>>;
  pathDirectory: string | null;
  setPathDirectory: Dispatch<SetStateAction<string | null>>;
} | null>(null);

export const usePlayerContext = () => {
  return useContext(PlayerContext) ?? throwError();
};

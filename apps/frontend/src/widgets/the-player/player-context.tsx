'use client';

import { type components } from '@/lib/types/openapi';
import { throwError } from '@/shared/utils/throw-error';
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react';

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

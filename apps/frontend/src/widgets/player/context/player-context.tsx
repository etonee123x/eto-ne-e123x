'use client';

import { type components } from '@/shared/api/openapi';
import { throwError } from '@/shared/utils/throw-error';
import { createContext, type Dispatch, type RefObject, type SetStateAction, useContext } from 'react';

type Track = components['schemas']['FolderDataItemAudio'];

export const PlayerContext = createContext<{
  track: Track | null;
  setTrack: Dispatch<SetStateAction<Track | null>>;
  playlist: Array<Track>;
  setPlaylist: Dispatch<SetStateAction<Array<Track>>>;
  pathDirectory: string | null;
  setPathDirectory: Dispatch<SetStateAction<string | null>>;

  audioRef: RefObject<HTMLAudioElement | null>;
} | null>(null);

export const usePlayerContext = () => {
  return useContext(PlayerContext) ?? throwError();
};

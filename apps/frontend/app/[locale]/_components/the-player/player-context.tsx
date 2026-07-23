'use client';

import { components } from '@/lib/types/openapi';
import { createContext } from 'react';

type Track = components['schemas']['FolderDataItemAudio'];

export const PlayerContext = createContext<{
  track: Track | null;
  setTrack: (track: Track | null) => void;
  playlist: Array<Track>;
  setPlaylist: (playlist: Array<Track>) => void;
} | null>(null);

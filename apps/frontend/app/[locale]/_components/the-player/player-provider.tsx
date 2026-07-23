'use client';

import { ContextType, PropsWithChildren, useState } from 'react';
import { PlayerContext } from './player-context';

export const PlayerProvider = ({ children }: PropsWithChildren) => {
  const [track, setTrack] = useState<NonNullable<ContextType<typeof PlayerContext>>['track']>(null);
  const [playlist, setPlaylist] = useState<NonNullable<ContextType<typeof PlayerContext>>['playlist']>([]);
  const [pathDirectory, setPathDirectory] =
    useState<NonNullable<ContextType<typeof PlayerContext>>['pathDirectory']>(null);

  return (
    <PlayerContext
      value={{
        track,
        setTrack,

        playlist,
        setPlaylist,

        pathDirectory,
        setPathDirectory,
      }}
    >
      {children}
    </PlayerContext>
  );
};

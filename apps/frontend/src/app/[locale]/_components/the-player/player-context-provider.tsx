'use client';

import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { type components } from '@/lib/types/openapi';
import { type ContextType, type PropsWithChildren, useState } from 'react';
import { PlayerContext } from './player-context';

export const PlayerContextProvider = ({
  children,
  initialFolderData,
}: PropsWithChildren<{
  initialFolderData: components['schemas']['FolderDataResponse'] | null;
}>) => {
  const [track, setTrack] = useState<NonNullable<ContextType<typeof PlayerContext>>['track']>(
    initialFolderData?.file?.fileType === FILE_TYPES.AUDIO ? initialFolderData.file : null,
  );
  const [playlist, setPlaylist] = useState<NonNullable<ContextType<typeof PlayerContext>>['playlist']>(() => {
    return (
      initialFolderData?.files.filter((file) => {
        return file.fileType === FILE_TYPES.AUDIO;
      }) ?? []
    );
  });
  const [pathDirectory, setPathDirectory] = useState<NonNullable<ContextType<typeof PlayerContext>>['pathDirectory']>(
    initialFolderData?.pathDirectory ?? null,
  );

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

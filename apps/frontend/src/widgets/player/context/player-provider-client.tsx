'use client';

import { FILE_TYPES } from '@/entities/file';
import { type components } from '@/shared/api/openapi';
import { type ContextType, type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { PlayerContext } from './player-context';
import { isClient } from '@/shared/utils/target';

export const PlayerProviderClient = ({
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

  const audioRef = useRef<HTMLAudioElement | null>(isClient ? new Audio() : null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!track?.src) {
      return;
    }

    audio.autoplay = true;
    audio.src = track.src;

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [track?.src]);

  return (
    <PlayerContext
      value={{
        track,
        setTrack,

        playlist,
        setPlaylist,

        pathDirectory,
        setPathDirectory,

        audioRef,
      }}
    >
      {children}
    </PlayerContext>
  );
};

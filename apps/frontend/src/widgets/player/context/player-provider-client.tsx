'use client';

import { type ContextType, type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { PlayerContext } from './player-context';
import { isClient } from '@/shared/utils/target';
import { throwError } from '@/shared/utils/throw-error';
import { useRouter } from '@/i18n/navigation';

type Track = NonNullable<NonNullable<ContextType<typeof PlayerContext>>['track']>;

export const PlayerProviderClient = ({
  children,
  initialTrack,
  initialPlaylist,
  initialTrackPathDirectory,
}: PropsWithChildren<{
  initialTrack: Track | null;
  initialPlaylist: Array<Track>;
  initialTrackPathDirectory: string | null;
}>) => {
  const router = useRouter();

  const [track, setTrack] = useState<Track | null>(initialTrack);
  const [playlist, setPlaylist] = useState<Array<Track>>(initialPlaylist);
  const [trackPathDirectory, setTrackPathDirectory] = useState<string | null>(initialTrackPathDirectory);

  const pathDirectory = useRef<string | null>(initialTrackPathDirectory);

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

  const close = useCallback(() => {
    setTrack(null);

    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    if (trackPathDirectory !== pathDirectory.current) {
      return;
    }

    router.push('/explorer' + (pathDirectory.current ?? ''), { scroll: false });
  }, [setTrack, trackPathDirectory, pathDirectory, router]);

  const open: NonNullable<ContextType<typeof PlayerContext>>['open'] = useCallback(
    (track, playlist, pathDirectory) => {
      setTrack(track);
      setPlaylist(playlist);
      setTrackPathDirectory(pathDirectory);
    },
    [setTrack, setPlaylist, setTrackPathDirectory],
  );

  const setCurrentPlayingNumber: NonNullable<ContextType<typeof PlayerContext>>['setCurrentPlayingNumber'] =
    useCallback(
      (playingNumber) => {
        setTrack(playlist[playingNumber] ?? throwError());
      },
      [playlist],
    );

  const setPathDirectory: NonNullable<ContextType<typeof PlayerContext>>['setPathDirectory'] = useCallback(
    (_pathDirectory) => {
      pathDirectory.current = _pathDirectory;
    },
    [],
  );

  return (
    <PlayerContext
      value={{
        track,
        playlist,

        open,
        close,

        setCurrentPlayingNumber,

        setPathDirectory,

        audioRef,
      }}
    >
      {children}
    </PlayerContext>
  );
};

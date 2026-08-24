'use client';

import { type ContextType, type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { PlayerContext } from './player-context';
import { isClient } from '@/shared/utils/target';
import { throwError } from '@/shared/utils/throw-error';
import { useRouter } from '@/i18n/navigation';
import { getRandomExceptCurrentIndex } from '@/shared/utils/get-random-except-current-index';

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
  }, [trackPathDirectory, pathDirectory, router]);

  const open: NonNullable<ContextType<typeof PlayerContext>>['open'] = useCallback((track, playlist, pathDirectory) => {
    setTrack(track);
    setPlaylist(playlist);
    setTrackPathDirectory(pathDirectory);
  }, []);

  const currentPlayingNumber = playlist.findIndex((playlistItem) => {
    return playlistItem.src === track?.src;
  });

  const [isShuffleModeEnabled, setIsShuffleModeEnabled] = useState(false);
  const [historyItems, setHistoryItems] = useState<Array<number>>([]);
  const hasHistoryItems = historyItems.length > 0;

  const setCurrentPlayingNumber: NonNullable<ContextType<typeof PlayerContext>>['setCurrentPlayingNumber'] =
    useCallback(
      (playingNumber) => {
        setTrack(playlist[playingNumber] ?? throwError());
      },
      [playlist],
    );

  const next = useCallback(() => {
    if (currentPlayingNumber === -1 || playlist.length === 0) {
      return;
    }

    setHistoryItems((historyItems) => {
      return [...historyItems, currentPlayingNumber];
    });
    setCurrentPlayingNumber(
      isShuffleModeEnabled
        ? getRandomExceptCurrentIndex(playlist.length, currentPlayingNumber)
        : (currentPlayingNumber + 1) % playlist.length,
    );
  }, [currentPlayingNumber, playlist, isShuffleModeEnabled, setCurrentPlayingNumber]);

  const previous = useCallback(() => {
    if (currentPlayingNumber === -1 || playlist.length === 0) {
      return;
    }

    if (historyItems.length === 0) {
      setCurrentPlayingNumber((currentPlayingNumber - 1 + playlist.length) % playlist.length);
      return;
    }

    const previousPlayingNumber = historyItems.at(-1);
    setHistoryItems((historyItems) => {
      return historyItems.slice(0, -1);
    });
    setCurrentPlayingNumber(previousPlayingNumber ?? 0);
  }, [currentPlayingNumber, playlist, historyItems, setCurrentPlayingNumber]);

  const setPathDirectory: NonNullable<ContextType<typeof PlayerContext>>['setPathDirectory'] = useCallback(
    (_pathDirectory) => {
      pathDirectory.current = _pathDirectory;
    },
    [],
  );

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

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    audio?.addEventListener('ended', next);

    return () => {
      audio?.removeEventListener('ended', next);
    };
  }, [next]);

  return (
    <PlayerContext
      value={{
        track,

        open,
        next,
        previous,
        close,

        isShuffleModeEnabled,
        setIsShuffleModeEnabled,

        setCurrentPlayingNumber,

        setPathDirectory,

        audioRef,
        hasHistoryItems,
      }}
    >
      {children}
    </PlayerContext>
  );
};

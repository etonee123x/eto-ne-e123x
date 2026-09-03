'use client';

import { type ContextType, type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { PlayerContext } from './player-context';
import { throwError } from '@/shared/utils/throw-error';
import { useRouter } from '@/i18n/navigation';
import { getRandomExceptCurrentIndex } from '@/shared/utils/get-random-except-current-index';
import { AudioProviderClient } from './audio-provider-client';

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

  const open: NonNullable<ContextType<typeof PlayerContext>>['open'] = useCallback((track, playlist, pathDirectory) => {
    setTrack(track);
    setPlaylist(playlist);
    setTrackPathDirectory(pathDirectory);
  }, []);

  const close = useCallback(() => {
    setTrack(null);

    if (trackPathDirectory !== pathDirectory.current) {
      return;
    }

    router.push('/explorer' + (pathDirectory.current ?? ''), { scroll: false });
  }, [trackPathDirectory, pathDirectory, router]);

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

  const playerContextValue = useMemo<NonNullable<ContextType<typeof PlayerContext>>>(() => {
    return {
      track,

      open,
      next,
      previous,
      close,

      isShuffleModeEnabled,
      setIsShuffleModeEnabled,

      setCurrentPlayingNumber,

      setPathDirectory,
      hasHistoryItems,
    };
  }, [
    close,
    hasHistoryItems,
    isShuffleModeEnabled,
    next,
    open,
    previous,
    setCurrentPlayingNumber,
    setPathDirectory,
    track,
  ]);

  return (
    <AudioProviderClient src={track?.src ?? null} onEnded={next}>
      <PlayerContext value={playerContextValue}>{children}</PlayerContext>
    </AudioProviderClient>
  );
};

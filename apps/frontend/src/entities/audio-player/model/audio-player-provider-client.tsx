'use client';

import { type ContextType, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioPlayerContext } from './audio-player-context';
import { useIsTouchOnly } from '@/shared/hooks/use-is-touch-only';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getRandomExceptCurrentIndex } from '@/shared/utils/get-random-except-current-index';
import { throwError } from '@/shared/utils/throw-error';
import { useSinglePlayback } from '@/shared/hooks/use-single-playback';
import { localStorageVolume, DEFAULT_VOLUME } from './local-storage-volume';
import { isClient } from '@/shared/utils/target';
import { useEventListener } from '@reactuses/core';

type Track = NonNullable<NonNullable<ContextType<typeof AudioPlayerContext>>['track']>;

export const AudioPlayerProviderClient = ({
  children,
  initialTrack,
  initialPlaylist,
  initialPlaylistPathDirectory,
}: PropsWithChildren<{
  initialTrack: Track | null;
  initialPlaylist: Array<Track>;
  initialPlaylistPathDirectory: string | null;
}>) => {
  const router = useRouter();

  const pathname = usePathname();

  const isTouchOnly = useIsTouchOnly();

  const [track, setTrack] = useState<Track | null>(initialTrack);

  const [playlist, setPlaylist] = useState<Array<Track>>(initialPlaylist);

  const [playlistPathDirectory, setPlaylistPathDirectory] = useState<string | null>(initialPlaylistPathDirectory);

  const [isShuffleModeEnabled, setIsShuffleModeEnabled] = useState(false);

  const [historyItems, setHistoryItems] = useState<Array<number>>([]);

  const pathDirectory = useRef<string | null>(initialPlaylistPathDirectory);

  const audio = useRef<HTMLAudioElement | null>(null);

  // eslint-disable-next-line react-hooks/refs -- create one stable browser Audio resource.
  if (audio.current === null && isClient) {
    const audioCurrent = new Audio();

    audioCurrent.volume = isTouchOnly ? DEFAULT_VOLUME : localStorageVolume.get();
    audio.current = audioCurrent;
  }

  const { playback } = useSinglePlayback({
    onOtherPlayback: () => {
      audio.current?.pause();
    },
  });

  const open: NonNullable<ContextType<typeof AudioPlayerContext>>['open'] = useCallback(
    (track, playlist, pathDirectory) => {
      setTrack(track);
      setPlaylist(playlist);
      setPlaylistPathDirectory(pathDirectory);
    },
    [],
  );

  const close = useCallback(() => {
    setTrack(null);

    if (playlistPathDirectory === pathDirectory.current) {
      router.push('/explorer' + (pathDirectory.current ?? ''), { scroll: false });
    }
  }, [playlistPathDirectory, router]);

  const currentPlayingNumber = playlist.findIndex((playlistItem) => {
    return playlistItem.src === track?.src;
  });

  const setCurrentPlayingNumber: NonNullable<ContextType<typeof AudioPlayerContext>>['setCurrentPlayingNumber'] =
    useCallback(
      (playingNumber) => {
        setTrack(playlist[playingNumber] ?? throwError());
      },
      [playlist],
    );

  const getNextPlayingNumber = useCallback(() => {
    if (currentPlayingNumber === -1 || playlist.length === 0) {
      return null;
    }

    return isShuffleModeEnabled
      ? getRandomExceptCurrentIndex(playlist.length, currentPlayingNumber)
      : (currentPlayingNumber + 1) % playlist.length;
  }, [currentPlayingNumber, isShuffleModeEnabled, playlist.length]);

  const maybeNavigateToTrack = useCallback(
    (_track: Track) => {
      if (!(track && decodeURIComponent(pathname) === '/explorer' + track.path)) {
        return;
      }

      router.replace('/explorer' + _track.path, { scroll: false });
    },
    [pathname, router, track],
  );

  const next = useCallback(() => {
    const nextPlayingNumber = getNextPlayingNumber();
    if (nextPlayingNumber === null) {
      return;
    }

    const nextTrack = playlist[nextPlayingNumber] ?? throwError();
    maybeNavigateToTrack(nextTrack);

    setHistoryItems((historyItems) => {
      return [...historyItems, currentPlayingNumber];
    });

    setCurrentPlayingNumber(nextPlayingNumber);
  }, [currentPlayingNumber, getNextPlayingNumber, maybeNavigateToTrack, playlist, setCurrentPlayingNumber]);

  const previous = useCallback(() => {
    if (currentPlayingNumber === -1 || playlist.length === 0) {
      return;
    }

    if (historyItems.length === 0) {
      const previousPlayingNumber = (currentPlayingNumber - 1 + playlist.length) % playlist.length;
      const previousTrack = playlist[previousPlayingNumber] ?? throwError();
      maybeNavigateToTrack(previousTrack);

      setCurrentPlayingNumber(previousPlayingNumber);

      return;
    }

    const previousPlayingNumber = historyItems.at(-1);
    const previousTrack = playlist[previousPlayingNumber ?? 0] ?? throwError();

    setHistoryItems((historyItems) => {
      return historyItems.slice(0, -1);
    });

    maybeNavigateToTrack(previousTrack);

    setCurrentPlayingNumber(previousPlayingNumber ?? 0);
  }, [currentPlayingNumber, historyItems, maybeNavigateToTrack, playlist, setCurrentPlayingNumber]);

  const setPathDirectory: NonNullable<ContextType<typeof AudioPlayerContext>>['setPathDirectory'] = useCallback(
    (nextPathDirectory) => {
      pathDirectory.current = nextPathDirectory;
    },
    [],
  );

  useEventListener('play', playback, audio);
  useEventListener(
    'volumechange',
    () => {
      if (!audio.current) {
        return;
      }

      localStorageVolume.set(audio.current.volume);
    },
    audio,
  );

  useEffect(() => {
    const audioCurrent = audio.current;

    if (!audioCurrent) {
      return;
    }

    audioCurrent.autoplay = true;

    return () => {
      audioCurrent.pause();
      audioCurrent.removeAttribute('src');
      audioCurrent.load();
    };
  }, []);

  useEffect(() => {
    const audioCurrent = audio.current;

    if (!('mediaSession' in navigator)) {
      return;
    }

    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.metadata.artists.join(', '),
      album: track.metadata.album ?? undefined,
    });
    navigator.mediaSession.setActionHandler('play', () => {
      audioCurrent?.play();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioCurrent?.pause();
    });
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', previous);
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      if (audioCurrent) {
        audioCurrent.currentTime = Math.max(0, audioCurrent.currentTime - 10);
      }
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (audioCurrent) {
        audioCurrent.currentTime = Math.min(track.metadata.duration / 1000, audioCurrent.currentTime + 10);
      }
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [next, previous, track]);

  useEffect(() => {
    if (!track) {
      return;
    }

    const audioCurrent = audio.current;

    if (!audioCurrent) {
      return;
    }

    audioCurrent.src = track.src;

    return () => {
      audioCurrent.pause();
      audioCurrent.currentTime = 0;
      audioCurrent.removeAttribute('src');
      audioCurrent.load();
    };
  }, [track]);

  useEffect(() => {
    if (!isTouchOnly) {
      if (audio.current) {
        audio.current.volume = localStorageVolume.get();
      }
      return;
    }

    if (audio.current) {
      audio.current.volume = DEFAULT_VOLUME;
    }
  }, [isTouchOnly]);

  const playerValue = useMemo<NonNullable<ContextType<typeof AudioPlayerContext>>>(() => {
    return {
      audio,
      track,
      playlistPathDirectory,
      open,
      next,
      previous,
      close,
      isShuffleModeEnabled,
      setIsShuffleModeEnabled,
      setCurrentPlayingNumber,
      setPathDirectory,
      hasHistoryItems: historyItems.length > 0,
    };
  }, [
    close,
    historyItems.length,
    isShuffleModeEnabled,
    next,
    open,
    previous,
    setCurrentPlayingNumber,
    setPathDirectory,
    playlistPathDirectory,
    track,
  ]);

  return <AudioPlayerContext value={playerValue}>{children}</AudioPlayerContext>;
};

'use client';

import { type ContextType, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isClient } from '@/shared/utils/target';
import { AudioStoreContext } from './audio-store-context';
import { AudioControllerContext, type AudioController } from './audio-controller-context';
import { AudioPlayerContext } from './audio-player-context';
import { useIsTouchOnly } from '@/shared/hooks/use-is-touch-only';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getRandomExceptCurrentIndex } from '@/shared/utils/get-random-except-current-index';
import { throwError } from '@/shared/utils/throw-error';
import { useSinglePlayback } from '@/shared/hooks/use-single-playback';
import { createAudioStore, DEFAULT_VOLUME } from './audio-store';
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

  const audioRef = useRef<HTMLAudioElement | null>(isClient ? new Audio() : null);

  const { playback } = useSinglePlayback({
    onOtherPlayback: () => {
      audioRef.current?.pause();
    },
  });

  const [store] = useState(() => {
    return createAudioStore();
  });

  const audioController = useMemo<AudioController>(() => {
    return {
      play: () => {
        return audioRef.current?.play();
      },
      pause: () => {
        audioRef.current?.pause();
      },
      setCurrentTime: (currentTime) => {
        const audio = audioRef.current;
        if (!audio) {
          return;
        }

        audio.currentTime = currentTime;
        store.setCurrentTime(currentTime);
      },
      setVolume: (volume) => {
        store.setVolume(volume);
        const audio = audioRef.current;
        if (audio) {
          audio.volume = volume;
        }
      },
    };
  }, [store]);

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

  useEffect(() => {
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
    navigator.mediaSession.setActionHandler('play', audioController.play);
    navigator.mediaSession.setActionHandler('pause', audioController.pause);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', previous);
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      audioController.setCurrentTime(Math.max(0, store.currentTime - 10));
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      audioController.setCurrentTime(Math.min(track.metadata.duration / 1000, store.currentTime + 10));
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [audioController, next, previous, store, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (!track) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
      return;
    }
    audio.autoplay = true;
    audio.src = track.src;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [store, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isTouchOnly ? DEFAULT_VOLUME : store.volume;
    }
  }, [isTouchOnly, store]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [store]);

  const onPlay = () => {
    playback();
    store.setIsPlaying(true);
  };

  const onPause = () => {
    store.setIsPlaying(false);
  };

  const onResetCurrentTime = () => {
    store.setCurrentTime(0);
  };

  const onTimeUpdate = (event: Event) => {
    if (!(event.currentTarget instanceof HTMLAudioElement)) {
      return;
    }

    store.setCurrentTime(event.currentTarget.currentTime);
  };

  const onVolumeChange = (event: Event) => {
    if (!(event.currentTarget instanceof HTMLAudioElement) || isTouchOnly) {
      return;
    }

    store.setVolume(event.currentTarget.volume);
  };

  useEventListener('ended', next, audioRef);
  useEventListener('play', onPlay, audioRef);
  useEventListener('pause', onPause, audioRef);
  useEventListener('loadstart', onResetCurrentTime, audioRef);
  useEventListener('emptied', onResetCurrentTime, audioRef);
  useEventListener('timeupdate', onTimeUpdate, audioRef);
  useEventListener('volumechange', onVolumeChange, audioRef);

  const playerValue = useMemo<NonNullable<ContextType<typeof AudioPlayerContext>>>(() => {
    return {
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

  return (
    <AudioControllerContext value={audioController}>
      <AudioStoreContext value={store}>
        <AudioPlayerContext value={playerValue}>{children}</AudioPlayerContext>
      </AudioStoreContext>
    </AudioControllerContext>
  );
};

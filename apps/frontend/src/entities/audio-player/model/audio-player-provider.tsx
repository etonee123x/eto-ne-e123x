'use client';

import { type ContextType, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isClient } from '@/shared/utils/target';
import { useBroadcastChannel, useEventListener } from '@reactuses/core';
import { isNil } from '@/shared/utils/is-nil';
import { AudioStoreContext, type AudioStore } from './audio-store-context';
import { PlayerContext } from './player-context';
import { useIsTouchOnly } from '@/shared/hooks/use-is-touch-only';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getRandomExceptCurrentIndex } from '@/shared/utils/get-random-except-current-index';
import { throwError } from '@/shared/utils/throw-error';

const DEFAULT_VOLUME = 1;

const localStorageVolume = (() => {
  const LOCAL_STORAGE_KEY = 'player:volume';

  return {
    get: () => {
      if (!('localStorage' in globalThis)) {
        return null;
      }

      const value = globalThis.localStorage.getItem(LOCAL_STORAGE_KEY);

      if (isNil(value) || Number.isNaN(Number(value))) {
        globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, String(DEFAULT_VOLUME));
        return DEFAULT_VOLUME;
      }

      return Number(value);
    },
    set: (volume: number) => {
      if ('localStorage' in globalThis) {
        globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, String(volume));
      }
    },
  };
})();

interface PlayerMessage {
  type: 'play';
}

type PlayerEvent = MessageEvent<PlayerMessage>;
type Track = NonNullable<NonNullable<ContextType<typeof PlayerContext>>['track']>;
interface InternalAudioStore extends AudioStore {
  notify: () => void;
}

const createAudioStore = (): InternalAudioStore => {
  const listeners = new Set<() => void>();
  let audioElement: HTMLAudioElement | null = null;
  const notify = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };
  const store: InternalAudioStore = {
    currentTime: 0,
    volume: localStorageVolume.get() ?? DEFAULT_VOLUME,
    isPlaying: false,
    play: () => {
      return audioElement?.play();
    },
    pause: () => {
      return audioElement?.pause();
    },
    setCurrentTime: (currentTime) => {
      if (!audioElement) {
        return;
      }

      audioElement.currentTime = currentTime;
      store.currentTime = currentTime;
      notify();
    },
    setVolume: (volume) => {
      localStorageVolume.set(volume);
      store.volume = volume;
      if (audioElement) {
        audioElement.volume = volume;
      }
      notify();
    },
    setAudioElement: (nextAudioElement) => {
      audioElement = nextAudioElement;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        return listeners.delete(listener);
      };
    },
    notify,
  };

  return store;
};

export const AudioPlayerProvider = ({
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

  const { post, channel } = useBroadcastChannel<PlayerMessage, PlayerMessage>({ name: 'audio' });

  const isTouchOnly = useIsTouchOnly();

  const [track, setTrack] = useState<Track | null>(initialTrack);

  const [playlist, setPlaylist] = useState<Array<Track>>(initialPlaylist);

  const [playlistPathDirectory, setPlaylistPathDirectory] = useState<string | null>(initialPlaylistPathDirectory);

  const [isShuffleModeEnabled, setIsShuffleModeEnabled] = useState(false);

  const [historyItems, setHistoryItems] = useState<Array<number>>([]);

  const pathDirectory = useRef<string | null>(initialPlaylistPathDirectory);

  const audioRef = useRef<HTMLAudioElement | null>(isClient ? new Audio() : null);

  const [store] = useState(() => {
    return createAudioStore();
  });

  const open: NonNullable<ContextType<typeof PlayerContext>>['open'] = useCallback((track, playlist, pathDirectory) => {
    setTrack(track);
    setPlaylist(playlist);
    setPlaylistPathDirectory(pathDirectory);
  }, []);

  const close = useCallback(() => {
    setTrack(null);

    if (playlistPathDirectory === pathDirectory.current) {
      router.push('/explorer' + (pathDirectory.current ?? ''), { scroll: false });
    }
  }, [playlistPathDirectory, router]);

  const currentPlayingNumber = playlist.findIndex((playlistItem) => {
    return playlistItem.src === track?.src;
  });

  const setCurrentPlayingNumber: NonNullable<ContextType<typeof PlayerContext>>['setCurrentPlayingNumber'] =
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

      router.push('/explorer' + _track.path, { scroll: false });
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

  const setPathDirectory: NonNullable<ContextType<typeof PlayerContext>>['setPathDirectory'] = useCallback(
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
    navigator.mediaSession.setActionHandler('play', store.play);
    navigator.mediaSession.setActionHandler('pause', store.pause);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', previous);
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      store.setCurrentTime(Math.max(0, store.currentTime - 10));
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      store.setCurrentTime(Math.min(track.metadata.duration / 1000, store.currentTime + 10));
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [next, previous, store, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    store.setAudioElement(audio);
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
    audio?.addEventListener('ended', next);

    return () => {
      audio?.removeEventListener('ended', next);
    };
  }, [next]);

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
      store.setAudioElement(null);
    };
  }, [store]);

  useEffect(() => {
    const audio = audioRef.current;
    const onPlay = () => {
      post({ type: 'play' });
      store.isPlaying = true;
      store.notify();
    };
    const onPause = () => {
      store.isPlaying = false;
      store.notify();
    };
    const onResetCurrentTime = () => {
      store.currentTime = 0;
      store.notify();
    };
    const onTimeUpdate = (event: Event) => {
      if (event.currentTarget instanceof HTMLAudioElement) {
        store.currentTime = event.currentTarget.currentTime;
        store.notify();
      }
    };
    const onVolumeChange = (event: Event) => {
      if (event.currentTarget instanceof HTMLAudioElement && !isTouchOnly) {
        store.volume = event.currentTarget.volume;
        localStorageVolume.set(store.volume);
        store.notify();
      }
    };
    audio?.addEventListener('play', onPlay);
    audio?.addEventListener('pause', onPause);
    audio?.addEventListener('loadstart', onResetCurrentTime);
    audio?.addEventListener('emptied', onResetCurrentTime);
    audio?.addEventListener('timeupdate', onTimeUpdate);
    audio?.addEventListener('volumechange', onVolumeChange);
    return () => {
      audio?.removeEventListener('play', onPlay);
      audio?.removeEventListener('pause', onPause);
      audio?.removeEventListener('loadstart', onResetCurrentTime);
      audio?.removeEventListener('emptied', onResetCurrentTime);
      audio?.removeEventListener('timeupdate', onTimeUpdate);
      audio?.removeEventListener('volumechange', onVolumeChange);
    };
  }, [isTouchOnly, post, store]);

  useEventListener<PlayerEvent>(
    'message',
    () => {
      return audioRef.current?.pause();
    },
    channel,
  );

  const playerValue = useMemo<NonNullable<ContextType<typeof PlayerContext>>>(() => {
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
    <AudioStoreContext value={store}>
      <PlayerContext value={playerValue}>{children}</PlayerContext>
    </AudioStoreContext>
  );
};

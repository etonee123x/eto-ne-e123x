'use client';

import { type ContextType, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isClient } from '@/shared/utils/target';
import { useBroadcastChannel, useEventListener } from '@reactuses/core';
import { isNil } from '@/shared/utils/is-nil';
import { AudioContext } from './audio-context';
import { useIsTouchOnly } from '@/shared/hooks/use-is-touch-only';

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
      if (!('localStorage' in globalThis)) {
        return;
      }

      globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, String(volume));
    },
  };
})();

interface PlayerMessage {
  type: 'play';
}

type PlayerEvent = MessageEvent<PlayerMessage>;

export const AudioProviderClient = ({
  children,
  src,
  onEnded,
}: PropsWithChildren<{
  src: string | null;
  onEnded: () => void;
}>) => {
  const { post, channel } = useBroadcastChannel<PlayerMessage, PlayerMessage>({ name: 'audio' });
  const isTouchOnly = useIsTouchOnly();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    return localStorageVolume.get() ?? DEFAULT_VOLUME;
  });
  const effectiveVolume = isTouchOnly ? DEFAULT_VOLUME : volume;

  const audioRef = useRef<HTMLAudioElement | null>(isClient ? new Audio() : null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.play();
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
  }, []);

  const setCurrentTime: NonNullable<ContextType<typeof AudioContext>>['setCurrentTime'] = useCallback((currentTime) => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = currentTime;
    setCurrentTimeState(currentTime);
  }, []);

  const setVolume: NonNullable<ContextType<typeof AudioContext>>['setVolume'] = useCallback(
    (volume) => {
      if (isTouchOnly) {
        if (audioRef.current) {
          audioRef.current.volume = DEFAULT_VOLUME;
        }

        return;
      }

      setVolumeState(volume);
      localStorageVolume.set(volume);

      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    },
    [isTouchOnly],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!src) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();

      return;
    }

    audio.autoplay = true;
    audio.src = src;

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [src]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = effectiveVolume;
  }, [effectiveVolume]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    audio?.addEventListener('ended', onEnded);

    return () => {
      audio?.removeEventListener('ended', onEnded);
    };
  }, [onEnded]);

  useEffect(() => {
    const audio = audioRef.current;

    const onPlay = () => {
      post({ type: 'play' });
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onResetCurrentTime = () => {
      setCurrentTimeState(0);
    };

    const onTimeUpdate = (event: Event) => {
      if (!(event.currentTarget instanceof HTMLAudioElement)) {
        return;
      }

      setCurrentTimeState(event.currentTarget.currentTime);
    };

    const onVolumeChange = (event: Event) => {
      if (!(event.currentTarget instanceof HTMLAudioElement)) {
        return;
      }

      const volume = event.currentTarget.volume;

      if (isTouchOnly) {
        return;
      }

      setVolumeState(volume);
      localStorageVolume.set(volume);
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
  }, [isTouchOnly, post]);

  useEventListener<PlayerEvent>(
    'message',
    () => {
      audioRef.current?.pause();
    },
    channel,
  );

  const value = useMemo<NonNullable<ContextType<typeof AudioContext>>>(() => {
    return {
      play,
      pause,
      isPlaying,
      currentTime,
      setCurrentTime,
      volume: effectiveVolume,
      setVolume,
    };
  }, [currentTime, effectiveVolume, isPlaying, pause, play, setCurrentTime, setVolume]);

  return <AudioContext value={value}>{children}</AudioContext>;
};

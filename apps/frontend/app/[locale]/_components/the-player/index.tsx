'use client';

import { ComponentProps, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext, usePlayerContext } from './player-context';
import { throwError } from '@/lib/utils/throw-error';
import { Button } from '@/components/ui/button';
import { Link, Pause, Play, Shuffle, SkipBack, SkipForward, X } from 'lucide-react';
import { millisecondsToHumanReadable } from '@/lib/utils/milliseconds-to-human-readable';
import { Slider } from '@/components/ui/slider';
import { Temporal } from 'temporal-polyfill';
import { Toggle } from '@/components/ui/toggle';
import { useTranslations } from 'next-intl';
import { getRandomExceptCurrentIndex } from '@/lib/utils/get-random-except-current-index';
import { BaseAlwaysScrollable } from '@/components/base-always-scrollable';

const millisecondsToTimeFormats = (milliseconds: number) => {
  return {
    humanReadable: millisecondsToHumanReadable(milliseconds),
    iso: Temporal.Duration.from({ milliseconds: Math.ceil(milliseconds) }).toString(),
  };
};

const onClickCopyLink = () => {
  globalThis.navigator.clipboard.writeText(globalThis.location.href);
};

const useIsPlaying = (audioRef: RefObject<HTMLAudioElement | null>) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onPlay = () => {
      setIsPlaying(true);
    };
    const onPause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioRef]);

  return isPlaying;
};

const PlayerSlider = ({ duration, audioRef }: { duration: number; audioRef: RefObject<HTMLAudioElement | null> }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const sliderTimeSeconds = seekPreview ?? currentTime;

  const currentTimeFormats = millisecondsToTimeFormats(sliderTimeSeconds * 1000);
  const durationFormats = millisecondsToTimeFormats(duration);

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = (event: Event) => {
      if (!(event.currentTarget instanceof HTMLAudioElement)) {
        return;
      }

      setCurrentTime(event.currentTarget.currentTime);
    };

    audio?.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio?.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioRef]);

  const onValueCommitted: ComponentProps<typeof Slider>['onValueCommitted'] = (value) => {
    const seconds = Number(value);

    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
    setCurrentTime(seconds);
    setSeekPreview(null);
  };

  const onValueChange: ComponentProps<typeof Slider>['onValueChange'] = (value) => {
    setSeekPreview(Number(value));
  };

  return (
    <div className="h-5 w-full mx-auto flex justify-between items-center gap-2">
      <time dateTime={currentTimeFormats.iso}>{currentTimeFormats.humanReadable}</time>
      <Slider
        max={duration / 1000}
        min={0}
        step={0.1}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        value={sliderTimeSeconds}
      />
      <time dateTime={durationFormats.iso}>{durationFormats.humanReadable}</time>
    </div>
  );
};

const PlayerControls = ({ audioRef }: { audioRef: RefObject<HTMLAudioElement | null> }) => {
  const { track, setTrack, playlist } = usePlayerContext();

  const t = useTranslations('ThePlayer');

  const [isShuffleModeEnabled, setIsShuffleModeEnabled] = useState(false);
  const [historyItems, setHistoryItems] = useState<Array<number>>([]);

  const isPlaying = useIsPlaying(audioRef);

  const currentPlayingNumber = playlist.findIndex((playlistItem) => {
    return playlistItem.src === track?.src;
  });

  const setCurrentPlayingNumber = (playingNumber: number) => {
    setTrack(playlist[playingNumber]);
  };

  const loadNext = () => {
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
  };

  const loadPrevious = () => {
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
  };

  const onClickPlay = () => {
    audioRef.current?.play();
  };

  const onClickPause = () => {
    audioRef.current?.pause();
  };

  const onClickPrevious = () => {
    loadPrevious();
  };

  const onClickNext = () => {
    loadNext();
  };

  if (!track) {
    return null;
  }

  return (
    <div className="grid grid-cols-[1fr_min-content_1fr] gap-4 items-center">
      <Toggle
        className="justify-self-end"
        aria-label={isShuffleModeEnabled ? t('disableShuffleTracks') : t('enableShuffleTracks')}
        pressed={isShuffleModeEnabled}
        onPressedChange={setIsShuffleModeEnabled}
      >
        <Shuffle />
      </Toggle>
      <ul className="flex justify-center gap-2">
        <li>
          <Button
            size="lg"
            disabled={isShuffleModeEnabled && historyItems.length === 0}
            aria-label={t('previousTrack')}
            onClick={onClickPrevious}
          >
            <SkipBack />
          </Button>
        </li>
        <li>
          {isPlaying ? (
            <Button size="lg" aria-label={t('pauseTrack')} onClick={onClickPause}>
              <Pause />
            </Button>
          ) : (
            <Button size="lg" aria-label={t('playTrack')} onClick={onClickPlay}>
              <Play />
            </Button>
          )}
        </li>
        <li>
          <Button size="lg" aria-label={t('nextTrack')} onClick={onClickNext}>
            <SkipForward />
          </Button>
        </li>
      </ul>
    </div>
  );
};

export const ButtonClose = ({ audioRef }: { audioRef: RefObject<HTMLAudioElement | null> }) => {
  const { setTrack } = useContext(PlayerContext) ?? throwError();
  const t = useTranslations('ThePlayer');

  const isPlaying = useIsPlaying(audioRef);

  const onClick = () => {
    setTrack(null);
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  if (isPlaying) {
    return null;
  }

  return (
    <Button
      className="absolute inset-e-2 top-2 hover-none:hidden"
      aria-label={t('closePlayer')}
      size="icon"
      variant="secondary"
      onClick={onClick}
    >
      <X />
    </Button>
  );
};

export const ThePlayer = () => {
  const t = useTranslations('ThePlayer');

  const { track } = usePlayerContext();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();

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
  }, [track]);

  if (!track) {
    return null;
  }

  return (
    <section className="bg-background z-player border-t border-primary-500 pt-2 pb-4 w-full sticky bottom-0">
      <div className="layout-container flex flex-col gap-2 justify-center">
        <ButtonClose audioRef={audioRef} />

        <BaseAlwaysScrollable className="[--base-always-scrollable--content--margin:0_auto]">
          <header className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
            <h2 className="col-start-2">{track.name}</h2>
            <button className="col-start-3 mt-0.5" aria-label={t('copyLink')} onClick={onClickCopyLink}>
              <Link className="size-4" />
            </button>
          </header>
        </BaseAlwaysScrollable>

        <PlayerSlider audioRef={audioRef} duration={track.metadata.duration ?? 0} />

        <PlayerControls audioRef={audioRef} />
      </div>
    </section>
  );
};

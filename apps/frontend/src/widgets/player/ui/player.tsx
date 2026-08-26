'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import { usePlayerContext } from '../context/player-context';
import { Link, Pause, Play, Shuffle, SkipBack, SkipForward, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BaseAlwaysScrollable } from '@/shared/ui/base-always-scrollable';
import { Button } from '@/shared/ui/ds/button';
import { Slider } from '@/shared/ui/ds/slider';
import { millisecondsToHumanReadable } from '@/shared/utils/milliseconds-to-human-readable';
import { Temporal } from 'temporal-polyfill';
import { Toggle } from '@/shared/ui/ds/toggle';
import { useIsTouchOnly } from '@/shared/hooks/use-is-touch-only';
import { useHasMounted } from '@/shared/hooks/use-has-mounted';
import { isNil } from '@/shared/utils/is-nil';

const onClickCopyLink = () => {
  globalThis.navigator.clipboard.writeText(globalThis.location.href);
};

const millisecondsToTimeFormats = (milliseconds: number) => {
  return {
    humanReadable: millisecondsToHumanReadable(milliseconds),
    iso: Temporal.Duration.from({ milliseconds: Math.ceil(milliseconds) }).toString(),
  };
};

const PlayerSlider = ({ duration }: { duration: number }) => {
  const t = useTranslations('ThePlayer');

  const [currentTime, setCurrentTime] = useState(0);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const sliderTimeSeconds = seekPreview ?? currentTime;

  const currentTimeFormats = millisecondsToTimeFormats(sliderTimeSeconds * 1000);
  const durationFormats = millisecondsToTimeFormats(duration);

  const { audioRef } = usePlayerContext();

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
    <div className="tabular-nums w-full mx-auto flex justify-between items-center gap-2">
      <time dateTime={currentTimeFormats.iso}>{currentTimeFormats.humanReadable}</time>
      <Slider
        aria-label={t('trackProgress')}
        className="cursor-pointer"
        max={duration / 1000}
        min={0}
        step={0.1}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        value={[sliderTimeSeconds]}
      />
      <time dateTime={durationFormats.iso}>{durationFormats.humanReadable}</time>
    </div>
  );
};

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

const PlayerControlsVolume = () => {
  const { audioRef } = usePlayerContext();
  const t = useTranslations('ThePlayer');

  const hasMounted = useHasMounted();

  const isTouchOnly = useIsTouchOnly();

  const [volume, setVolume] = useState(isTouchOnly ? DEFAULT_VOLUME : (localStorageVolume.get() ?? DEFAULT_VOLUME));

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = volume;
  }, [volume, audioRef]);

  const onValueChangeVolume: ComponentProps<typeof Slider>['onValueChange'] = (value) => {
    const volume = Number(value);
    setVolume(volume);
    localStorageVolume.set(volume);
  };

  return (
    hasMounted &&
    !isTouchOnly && (
      <Slider
        aria-label={t('volume')}
        className="cursor-pointer w-5/6 max-w-20"
        max={1}
        min={0}
        step={0.01}
        onValueChange={onValueChangeVolume}
        value={[volume]}
      />
    )
  );
};

const PlayerControls = () => {
  const t = useTranslations('ThePlayer');

  const { next, previous, audioRef, isShuffleModeEnabled, setIsShuffleModeEnabled, hasHistoryItems } =
    usePlayerContext();

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

  const onClickPlay = () => {
    audioRef.current?.play();
  };

  const onClickPause = () => {
    audioRef.current?.pause();
  };

  const onClickPrevious = () => {
    previous();
  };

  const onClickNext = () => {
    next();
  };

  const onPressedChangeIsShuffleModeEnabled: ComponentProps<typeof Toggle>['onPressedChange'] = (pressed) => {
    setIsShuffleModeEnabled(pressed);
  };

  const buttons = [
    {
      disabled: isShuffleModeEnabled && !hasHistoryItems,
      ariaLabel: t('previousTrack'),
      onClick: onClickPrevious,
      Icon: SkipBack,
    },
    isPlaying
      ? {
          ariaLabel: t('pauseTrack'),
          onClick: onClickPause,
          Icon: Pause,
        }
      : {
          ariaLabel: t('playTrack'),
          onClick: onClickPlay,
          Icon: Play,
        },
    {
      ariaLabel: t('nextTrack'),
      onClick: onClickNext,
      Icon: SkipForward,
    },
  ];

  return (
    <div className="grid grid-cols-[1fr_min-content_1fr] gap-4 items-center">
      <Toggle
        className="justify-self-end"
        aria-label={isShuffleModeEnabled ? t('disableShuffleTracks') : t('enableShuffleTracks')}
        pressed={isShuffleModeEnabled}
        onPressedChange={onPressedChangeIsShuffleModeEnabled}
      >
        <Shuffle />
      </Toggle>
      <ul className="flex justify-center gap-2">
        {/* FP */}
        {/* eslint-disable-next-line react-hooks/refs */}
        {buttons.map((button, index) => {
          return (
            <li key={index}>
              <Button size="lg" disabled={button.disabled} aria-label={button.ariaLabel} onClick={button.onClick}>
                <button.Icon />
              </Button>
            </li>
          );
        })}
      </ul>
      <PlayerControlsVolume />
    </div>
  );
};

export const Player = () => {
  const t = useTranslations('ThePlayer');

  const { track, close } = usePlayerContext();

  const onClickClose = () => {
    close();
  };

  if (!track) {
    return null;
  }

  return (
    <section className="bg-background z-player border-t border-primary pt-2 pb-4 w-full sticky bottom-0">
      <div className="layout-container flex flex-col gap-2 justify-center">
        <Button
          className="absolute inset-e-2 border-primary top-0 -translate-y-1/2!"
          aria-label={t('closePlayer')}
          size="icon"
          variant="secondary"
          onClick={onClickClose}
        >
          <X />
        </Button>

        <header className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
          <BaseAlwaysScrollable className="col-start-2 [--base-always-scrollable--content--margin:0_auto]">
            <h2>{track.name}</h2>
          </BaseAlwaysScrollable>
          <button className="col-start-3 mt-0.5" aria-label={t('copyLink')} onClick={onClickCopyLink}>
            <Link className="size-4" />
          </button>
        </header>

        <PlayerSlider duration={track.metadata.duration} />

        <PlayerControls />
      </div>
    </section>
  );
};

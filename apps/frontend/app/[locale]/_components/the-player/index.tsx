'use client';

import { useContext, useState } from 'react';
import { PlayerContext } from './player-context';
import { throwError } from '@/lib/utils/throw-error';
import { Button } from '@/components/ui/button';
import { Link, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { millisecondsToHumanReadable } from '@/lib/utils/milliseconds-to-human-readable';
import { Slider } from '@/components/ui/slider';
import { Temporal } from 'temporal-polyfill';
import { isClient } from '@/lib/utils/target';
import { Toggle } from '@/components/ui/toggle';
import { useTranslations } from 'next-intl';
import { getRandomExceptCurrentIndex } from '@/lib/utils/get-random-except-current-index';

const millisecondsToTimeFormats = (milliseconds: number) => {
  return {
    humanReadable: millisecondsToHumanReadable(milliseconds),
    iso: Temporal.Duration.from({ milliseconds: Math.ceil(milliseconds) }).toString(),
  };
};

export const ThePlayer = () => {
  const playerContext = useContext(PlayerContext) ?? throwError();
  const [isShuffleModeEnabled, setIsShuffleModeEnabled] = useState(false);
  const [historyItems, setHistoryItems] = useState<Array<number>>([]);
  const t = useTranslations('ThePlayer');

  if (!playerContext.track) {
    return null;
  }

  const currentPlayingNumber = playerContext.playlist.findIndex((playlistItem) => {
    return playlistItem.src === playerContext.track?.src;
  });

  const setCurrentPlayingNumber = (currentPlayingNumber: number) => {
    playerContext.setTrack(playerContext.playlist[currentPlayingNumber]);
  };

  let audio: null | HTMLAudioElement = null;
  if (isClient) {
    audio = new Audio(playerContext.track.src);
  }

  const currentTimeSeconds = audio?.currentTime ?? 0;
  const duration = playerContext.track.metadata.duration ?? 0;
  const isPaused = audio?.paused ?? true;

  const load = {
    next: () => {
      historyItems.push(currentPlayingNumber);

      setCurrentPlayingNumber(
        isShuffleModeEnabled
          ? getRandomExceptCurrentIndex(playerContext.playlist.length, currentPlayingNumber)
          : (currentPlayingNumber + 1) % playerContext.playlist.length,
      );
    },
    previous: () => {
      setCurrentPlayingNumber(
        historyItems.length > 0
          ? (historyItems.pop() ?? 0)
          : (currentPlayingNumber - 1 + playerContext.playlist.length) % playerContext.playlist.length,
      );
    },
  };

  const onClickTitle = () => {
    //
  };

  const onEnded = () => {
    //
  };

  const controlButtons = [
    {
      key: 'previous',
      Icon: SkipBack,
      onClick: () => {
        load.previous();
      },
      disabled: isShuffleModeEnabled && historyItems.length === 0,
      ariaLabel: t('previousTrack'),
    },
    isPaused
      ? {
          key: 'play',
          Icon: Play,
          onClick: () => {
            audio?.play();
          },
          ariaLabel: t('playTrack'),
        }
      : {
          key: 'pause',
          Icon: Pause,
          onClick: () => {
            audio?.pause();
          },
          ariaLabel: t('pauseTrack'),
        },
    {
      key: 'next',
      Icon: SkipForward,
      onClick: () => {
        load.next();
      },
      ariaLabel: t('nextTrack'),
    },
  ];

  const currentTimeFormats = millisecondsToTimeFormats(currentTimeSeconds);
  const durationFormats = millisecondsToTimeFormats(duration);

  return (
    <section className="bg-background z-player border-t border-primary-500 pt-2 pb-4 w-full">
      <div className="layout-container flex flex-col gap-2 justify-center">
        <header className="flex items-center gap-2 text-lg">
          <h2>{playerContext.track.name}</h2>
          <Button aria-label={t('copyLink')} className="p-1" onClick={onClickTitle}>
            <Link />
          </Button>
        </header>
        <audio src={playerContext.track.src} autoPlay onEnded={onEnded} ref={null} />
        <div className="h-5 w-full mx-auto flex justify-between items-center gap-2">
          <time dateTime={currentTimeFormats.iso}>{currentTimeFormats.humanReadable}</time>
          {/* <PlayerSlider
            multiplier={duration / 1000}
            isLazy
            value={currentTimeSeconds}
            onKeyDownRight={onKeyDownRightTime}
            onKeyDownLeft={onKeyDownLeftTime}
          /> */}
          <Slider />
          <time dateTime={durationFormats.iso}>{durationFormats.humanReadable}</time>
        </div>
        <div className="grid grid-cols-[1fr_min-content_1fr] grid-areas-['left_center_right'] gap-x-4 items-center">
          <Toggle
            className="whitespace-nowrap min-w-6 justify-self-end"
            aria-label={isShuffleModeEnabled ? t('disableShuffleTracks') : t('enableShuffleTracks')}
            pressed={isShuffleModeEnabled}
            onPressedChange={setIsShuffleModeEnabled}
          >
            <Shuffle className="text-2xl" />
          </Toggle>
          <ul className="flex justify-center gap-2">
            {controlButtons.map((controlButton) => {
              return (
                <li key={controlButton.key}>
                  <Button
                    disabled={controlButton.disabled}
                    className="whitespace-nowrap h-full w-8"
                    aria-label={controlButton.ariaLabel}
                    onClick={controlButton.onClick}
                  >
                    <controlButton.Icon className="text-2xl" />
                  </Button>
                </li>
              );
            })}
          </ul>
          {/* <ClientOnly v-if="!isMobile">
          <div class="flex h-full w-5/6 max-w-20 items-center">
            <PlayerSlider v-model="volume" @keydown.right="onKeyDownRightVolume" @keydown.left="onKeyDownLeftVolume" />
          </div>
        </ClientOnly> */}
        </div>
      </div>
    </section>
  );
};

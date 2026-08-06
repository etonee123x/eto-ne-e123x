'use client';

import { type ComponentProps, type RefObject, useState } from 'react';
import { usePlayerContext } from '../context/player-context';
import { useIsPlaying } from '../hooks/use-is-playing';
import { Button } from '@/shared/ui/ds/button';
import { Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { Toggle } from '@/shared/ui/ds/toggle';
import { useTranslations } from 'next-intl';
import { getRandomExceptCurrentIndex } from '@/shared/utils/get-random-except-current-index';

export const PlayerControls = ({ audioRef }: { audioRef: RefObject<HTMLAudioElement | null> }) => {
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

  const onPressedChangeIsShuffleModeEnabled: ComponentProps<typeof Toggle>['onPressedChange'] = (pressed) => {
    setIsShuffleModeEnabled(pressed);
  };

  const buttons = [
    {
      disabled: isShuffleModeEnabled && historyItems.length === 0,
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

  if (!track) {
    return null;
  }

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
    </div>
  );
};

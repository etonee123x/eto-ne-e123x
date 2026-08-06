'use client';

import { type ComponentProps, type RefObject, useEffect, useState } from 'react';
import { Slider } from '@/shared/ui/ds/slider';
import { millisecondsToHumanReadable } from '@/shared/utils/milliseconds-to-human-readable';
import { Temporal } from 'temporal-polyfill';

const millisecondsToTimeFormats = (milliseconds: number) => {
  return {
    humanReadable: millisecondsToHumanReadable(milliseconds),
    iso: Temporal.Duration.from({ milliseconds: Math.ceil(milliseconds) }).toString(),
  };
};

export const PlayerSlider = ({
  duration,
  audioRef,
}: {
  duration: number;
  audioRef: RefObject<HTMLAudioElement | null>;
}) => {
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

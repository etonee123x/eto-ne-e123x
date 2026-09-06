'use client';

import { useAudioPlayer } from '../model/audio-player-context';
import { useEffect, useState } from 'react';

const ActiveTrackProgress = ({ duration }: { duration: number }) => {
  const { audio } = useAudioPlayer();
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audioCurrent = audio.current;

    if (!audioCurrent) {
      return;
    }

    const onTimeUpdate = () => {
      setCurrentTime(audioCurrent.currentTime);
    };

    audioCurrent.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audioCurrent.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audio]);

  const percent = duration > 0 ? Math.min(100, ((currentTime * 1000) / duration) * 100) : 0;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 inset-s-0 bg-primary/20"
      style={{ width: `${percent}%` }}
    />
  );
};

export const AudioTrackProgress = ({ trackSrc, duration }: { trackSrc: string; duration: number }) => {
  const { track } = useAudioPlayer();

  return track?.src === trackSrc ? <ActiveTrackProgress duration={duration} /> : null;
};

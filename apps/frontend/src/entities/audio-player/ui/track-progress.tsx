'use client';

import { useAudioCurrentTime } from '../model/audio-store-context';
import { useAudioPlayer } from '../model/audio-player-context';

const ActiveTrackProgress = ({ duration }: { duration: number }) => {
  const currentTime = useAudioCurrentTime();
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

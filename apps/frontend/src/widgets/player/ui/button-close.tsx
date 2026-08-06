'use client';

import { useContext, type RefObject } from 'react';
import { PlayerContext } from '../context/player-context';
import { throwError } from '@/shared/utils/throw-error';
import { useTranslations } from 'next-intl';
import { useIsPlaying } from '../hooks/use-is-playing';
import { Button } from '@/shared/ui/ds/button';
import { X } from 'lucide-react';

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

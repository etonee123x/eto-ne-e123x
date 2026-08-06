import { useEffect, useRef } from 'react';
import { usePlayerContext } from '../context/player-context';
import { PlayerSlider } from './player-slider';
import { Link } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BaseAlwaysScrollable } from '@/shared/ui/base-always-scrollable';
import { isClient } from '@/shared/utils/target';
import { PlayerControls } from './player-controls';
import { ButtonClose } from './button-close';

const onClickCopyLink = () => {
  globalThis.navigator.clipboard.writeText(globalThis.location.href);
};

export const Player = () => {
  const t = useTranslations('ThePlayer');

  const { track } = usePlayerContext();

  // TODO: перенести в контекст
  const audioRef = useRef<HTMLAudioElement | null>(isClient ? new Audio() : null);

  useEffect(() => {
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
    <section className="bg-background z-player border-t border-primary pt-2 pb-4 w-full sticky bottom-0">
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

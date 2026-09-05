import { useSinglePlayback } from '@/shared/hooks/use-single-playback';
import { useRef, type ComponentProps, type EventHandler, type SyntheticEvent } from 'react';

export const Video = ({ ...props }: Omit<ComponentProps<'video'>, 'ref' | 'controls' | 'onPlay'>) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { playback } = useSinglePlayback({
    onOtherPlayback: () => {
      videoRef.current?.pause();
    },
  });

  const onPlay: EventHandler<SyntheticEvent<HTMLVideoElement>> = () => {
    playback();
  };

  return <video ref={videoRef} {...props} controls onPlay={onPlay} />;
};

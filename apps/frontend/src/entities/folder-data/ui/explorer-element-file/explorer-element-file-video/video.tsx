'use client';

import { BaseVideo } from '@/shared/ui/base-video';
import type { ComponentProps } from 'react';

const pauseVideo: ComponentProps<'video'>['onPlay'] = (event) => {
  event.currentTarget.pause();
};

export const Video = (props: Omit<ComponentProps<typeof BaseVideo>, 'onPlay'>) => {
  return <BaseVideo {...props} onPlay={pauseVideo} />;
};

'use client';

import { type ComponentProps, type CSSProperties, type PropsWithChildren, useRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { useElementSize } from '@reactuses/core';

export const BaseAlwaysScrollable = ({
  children,
  className,
  pixelsPerSecond = 60,
}: PropsWithChildren<
  {
    pixelsPerSecond?: number;
  } & Pick<ComponentProps<'div'>, 'className'>
>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [widthContainer] = useElementSize(containerRef, { box: 'border-box' });
  const [widthContent] = useElementSize(contentRef, { box: 'border-box' });

  const diff = widthContent - widthContainer;

  const style = {
    '--scroll-x-diff': `-${diff}px`,
    '--scroll-x-duration': `${(diff * 2 * 1000) / pixelsPerSecond}ms`,
  } as CSSProperties;

  return (
    <div className={cn('relative inline-flex overflow-hidden', className)} ref={containerRef}>
      <div
        className={cn(
          'm-(--base-always-scrollable--content--margin) whitespace-nowrap',
          diff > 0 && 'animate-scroll-x animation-duration-(--scroll-x-duration)',
        )}
        ref={contentRef}
        style={style}
      >
        {children}
      </div>
    </div>
  );
};

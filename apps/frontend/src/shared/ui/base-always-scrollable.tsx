'use client';

import { type CSSProperties, type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/utils/cn';

type BaseAlwaysScrollableProps = PropsWithChildren<{
  className?: string;
  duration?: string;
}>;

export const BaseAlwaysScrollable = ({ children, className, duration = '5000ms' }: BaseAlwaysScrollableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollDifference, setScrollDifference] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!(container && content)) {
      return;
    }

    const updateScrollDifference = () => {
      setScrollDifference(content.offsetWidth - container.offsetWidth);
    };
    const observer = new ResizeObserver(updateScrollDifference);

    observer.observe(container);
    observer.observe(content);
    updateScrollDifference();

    return () => {
      observer.disconnect();
    };
  }, []);

  const style = {
    '--scroll-x-diff': `-${scrollDifference}px`,
    '--scroll-x-duration': duration,
  } as CSSProperties;

  return (
    <div className="relative inline-flex overflow-hidden" ref={containerRef}>
      <div
        className={cn(
          'm-(--base-always-scrollable--content--margin) whitespace-nowrap',
          scrollDifference > 0 && 'animate-scroll-x',
          className,
        )}
        ref={contentRef}
        style={style}
      >
        {children}
      </div>
    </div>
  );
};

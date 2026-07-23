'use client';

import { type CSSProperties, type PointerEvent, type PropsWithChildren, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type BaseSwipableProps = PropsWithChildren<{
  className?: string;
  disappearDelay?: number;
  onSwiped: () => void;
  threshold?: number;
}>;

export const BaseSwipable = ({
  children,
  className,
  disappearDelay = 300,
  onSwiped,
  threshold = 0.25,
}: BaseSwipableProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerStartXRef = useRef(0);
  const [style, setStyle] = useState<CSSProperties>({});

  const resetPosition = () => {
    setStyle({ transform: 'translateX(0)', transition: 'transform 500ms' });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    setStyle({ transition: 'none' });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    setStyle({ transform: `translateX(${event.clientX - pointerStartXRef.current}px)`, transition: 'none' });
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);

    const difference = event.clientX - pointerStartXRef.current;
    const rootWidth = rootRef.current?.offsetWidth ?? 0;
    if (Math.abs(difference) <= rootWidth * threshold) {
      resetPosition();
      return;
    }

    setStyle({
      transform: `translateX(${globalThis.innerWidth * Math.sign(difference)}px)`,
      transition: `transform ${disappearDelay}ms`,
    });
    globalThis.setTimeout(onSwiped, disappearDelay);
  };

  return (
    <div
      className={cn('touch-pan-x', className)}
      onPointerCancel={resetPosition}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      ref={rootRef}
      style={style}
    >
      {children}
    </div>
  );
};

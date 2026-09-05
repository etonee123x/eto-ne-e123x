import { useCallback, useEffect, useRef } from 'react';
import { useEventListener, useRafFn } from '@reactuses/core';

export const useWindowScrollPosition = (
  callback: (direction: 'top' | 'bottom') => void,
  {
    offset = 0,
    enabled = true,
  }: {
    offset?: number;
    enabled?: boolean;
  } = {},
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const getBoundaryState = useCallback(() => {
    const scrollY = globalThis.window.scrollY;
    const maxScrollY = Math.max(
      0,
      Math.max(globalThis.document.documentElement.scrollHeight, globalThis.document.body.scrollHeight) -
        globalThis.window.innerHeight,
    );

    return {
      isTopReached: scrollY <= offset,
      isBottomReached: maxScrollY - scrollY <= offset,
    };
  }, [offset]);

  const onFrame = useCallback(() => {
    if (!enabled) {
      return;
    }

    const { isTopReached, isBottomReached } = getBoundaryState();

    if (!isTopReached && !isBottomReached) {
      return;
    }

    if (isTopReached) {
      callbackRef.current('top');
    }

    if (isBottomReached) {
      callbackRef.current('bottom');
    }
  }, [enabled, getBoundaryState]);

  const [stopLoop, startLoop, isActive] = useRafFn(onFrame, false);

  const evaluateScrollPosition = useCallback(() => {
    if (!enabled) {
      stopLoop();
      return;
    }

    const { isTopReached, isBottomReached } = getBoundaryState();

    if (isTopReached || isBottomReached) {
      if (!isActive()) {
        startLoop();
      }
    } else {
      stopLoop();
    }
  }, [enabled, getBoundaryState, isActive, startLoop, stopLoop]);

  useEventListener('scroll', evaluateScrollPosition, globalThis.window, { passive: true });
  useEventListener('resize', evaluateScrollPosition, globalThis.window, { passive: true });

  useEffect(() => {
    if (!enabled) {
      stopLoop();
      return;
    }

    evaluateScrollPosition();
  }, [enabled, evaluateScrollPosition, stopLoop]);
};

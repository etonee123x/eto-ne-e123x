import type { FunctionCallback } from '@etonee123x/shared/types';
import { useIsMobile } from '@/composables/useIsMobile';

export const useOnPostTextareaKeyDownEnter = (callback: FunctionCallback) => {
  const isMobile = useIsMobile();

  return (e: KeyboardEvent) => {
    if (isMobile) {
      return;
    }

    if (e.shiftKey || e.ctrlKey) {
      return;
    }

    e.preventDefault();

    callback();
  };
};

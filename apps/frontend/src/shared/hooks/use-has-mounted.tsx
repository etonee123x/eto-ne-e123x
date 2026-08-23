import { useSyncExternalStore } from 'react';
import { noop } from '../utils/noop';

export const useHasMounted = () => {
  return useSyncExternalStore(
    () => {
      return noop;
    },
    () => {
      return true;
    },
    () => {
      return false;
    },
  );
};

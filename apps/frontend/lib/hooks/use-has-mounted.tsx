import { useSyncExternalStore } from 'react';

const subscribeReturn = () => {};

export const useHasMounted = () => {
  return useSyncExternalStore(
    () => {
      return subscribeReturn;
    },
    () => {
      return true;
    },
    () => {
      return false;
    },
  );
};

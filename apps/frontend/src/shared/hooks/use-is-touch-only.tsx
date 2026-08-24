import { useMediaQuery } from '@reactuses/core';

export const useIsTouchOnly = () => {
  return useMediaQuery('(pointer: coarse) and (hover: none)');
};

import { isClient } from '@/shared/utils/target';

export const isTouchOnly = () => {
  return isClient && globalThis.matchMedia('(pointer: coarse) and (hover: none)').matches;
};

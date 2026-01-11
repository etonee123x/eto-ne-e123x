import { INJECTION_KEY_EXPRESS_CONTEXT } from '@/constants/injectionKeyExpressContext';
import { inject } from 'vue';

export const useExpressContext = () => {
  return inject(INJECTION_KEY_EXPRESS_CONTEXT);
};

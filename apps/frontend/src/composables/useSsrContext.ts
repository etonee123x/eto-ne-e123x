import { useSSRContext as _useSSRContext } from 'vue';

import type { ExpressContext } from '@/constants/injectionKeyExpressContext';

export interface SSRContext {
  express: ExpressContext;
  teleports: Record<string, string>;
}

export const useSSRContext = () => {
  return _useSSRContext<SSRContext>();
};

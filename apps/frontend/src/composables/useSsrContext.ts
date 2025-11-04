import { useSSRContext as _useSSRContext } from 'vue';

import type { ExpressContext } from '@/constants/injectionKeyExpressContext';

export interface SSRContext {
  express: ExpressContext;
  teleports: Record<string, string>;
  payload: Record<string, unknown>;
}

export const useSSRContext = () => _useSSRContext<SSRContext>();

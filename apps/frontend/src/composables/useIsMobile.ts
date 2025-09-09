import { isServer } from '@/constants/target';
import { useSSRContext } from './useSSRContext';
import { isMobile } from 'is-mobile';

export const useIsMobile = () => {
  const ssrContext = isServer ? useSSRContext() : null;

  return isMobile({ ua: ssrContext?.express.request.headers['user-agent'] });
};

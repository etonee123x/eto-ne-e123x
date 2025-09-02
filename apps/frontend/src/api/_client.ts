import { isAppModeTest } from '@/constants/appMode';
import { isDevelopment } from '@/constants/mode';
import { isClient, isServer } from '@/constants/target';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { createFetch } from 'ofetch';

const baseURL = (() => {
  if (isClient) {
    return String(import.meta.env.VITE_API_PREFIX);
  }

  if (isDevelopment) {
    return [
      process.env.SERVER_ORIGIN ?? throwError('SERVER_ORIGIN is not defined'),
      process.env.VITE_API_PREFIX ?? throwError('VITE_API_PREFIX is not defined'),
    ].join('');
  }

  return process.env.INNER_API_PREFIX ?? throwError('INNER_API_PREFIX is not defined');
})();

export const client = createFetch({
  defaults: {
    baseURL,
    credentials: 'include',
    ...(isServer && isAppModeTest
      ? {
          headers: {
            Authorization: `Basic ${Buffer.from([process.env.BASIC_USER, process.env.BASIC_PASSWORD].join(':')).toString('base64')}`,
          },
        }
      : {}),
  },
});

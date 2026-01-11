import { isAppModeDevelopment } from '@/constants/appMode';
import { isClient, isServer } from '@/constants/target';
import { getAuthorization } from '@/helpers/getAuthorization';
import { throwError } from '@etonee123x/shared/utils/throwError';
import type { paths } from '@/types/openapi';
import { createPathBasedClient } from 'openapi-fetch';

const baseUrl = (() => {
  if (isClient) {
    return String(import.meta.env.VITE_API_PREFIX);
  }

  if (isAppModeDevelopment) {
    return [
      process.env.SERVER_ORIGIN ?? throwError('SERVER_ORIGIN is not defined'),
      // process.env.VITE_API_PREFIX ?? throwError('VITE_API_PREFIX is not defined'),
    ].join('');
  }

  return process.env.INTERNAL_API_URL ?? throwError('INTERNAL_API_URL is not defined');
})();

export const client = createPathBasedClient<paths>({
  baseUrl,
  credentials: 'include',
  ...(isServer && isAppModeDevelopment
    ? {
        headers: {
          Authorization: getAuthorization(),
        },
      }
    : {}),
});

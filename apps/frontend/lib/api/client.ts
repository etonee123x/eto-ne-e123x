import type { paths } from '@/lib/types/openapi';
import { createPathBasedClient } from 'openapi-fetch';
import { isClient } from '@/lib/utils/target';
import { throwError } from '@/lib/utils/throw-error';

const baseUrl = (() => {
  if (isClient) {
    return '/api';
  }

  return process.env.INTERNAL_API_URL ?? process.env.SERVER_ORIGIN ?? throwError('INTERNAL_API_URL is not defined');
})();

export const client = createPathBasedClient<paths>({
  baseUrl,
});

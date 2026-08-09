import { client } from '@/shared/api/client';
import type { components } from '@/shared/api/openapi';

export const deletePostById = async (id: components['schemas']['PostResponse']['_meta']['id']) => {
  const response = await client['/posts/{id}'].DELETE({
    params: {
      path: { id },
    },
  });

  if (response.data) {
    return response.data;
  }

  if (response.error instanceof Error) {
    throw response.error;
  }

  throw new Error('Unknown error');
};

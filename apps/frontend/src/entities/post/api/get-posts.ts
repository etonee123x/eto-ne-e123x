import { client } from '@/shared/api/client';
import type { operations } from '@/shared/api/openapi';

export const getPosts = async (query: operations['getPosts']['parameters']['query']) => {
  const response = await client['/posts'].GET({
    params: { query },
  });

  if (response.data) {
    return response.data;
  }

  if (response.error instanceof Error) {
    throw response.error;
  }

  throw new Error('Unknown error');
};

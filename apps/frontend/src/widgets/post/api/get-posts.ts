import { client } from '@/shared/api/client';

export const getPosts = async () => {
  const response = await client['/posts'].GET();

  if (response.data) {
    return response.data;
  }

  if (response.error instanceof Error) {
    throw response.error;
  }

  throw new Error('Unknown error');
};

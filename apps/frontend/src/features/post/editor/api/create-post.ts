import { client } from '@/shared/api/client';
import type { components } from '@/shared/api/openapi';

export const createPost = async (
  data: Omit<components['schemas']['PostCreateRequest'], 'files'>,
  files: Array<File>,
) => {
  const response = await client['/posts'].POST({
    body: {
      files: [],
      text: data.text,
    },
    bodySerializer: (body) => {
      const formData = new FormData();

      formData.append('text', body.text);

      files.forEach((file) => {
        formData.append('files', file);
      });

      return formData;
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

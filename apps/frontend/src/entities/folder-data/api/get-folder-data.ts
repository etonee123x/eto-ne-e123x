import { client } from '@/shared/api/client';

export const getFolderData = async (path: string) => {
  const response = await client['/folder-data'].GET({
    params: {
      query: {
        path: decodeURIComponent(path),
      },
    },
  });

  if (response.data) {
    return response.data;
  }

  throw new Error(response.error.message);
};

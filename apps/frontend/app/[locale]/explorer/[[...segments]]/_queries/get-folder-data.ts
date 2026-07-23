import { client } from '@/lib/api/client';

export const getFolderData = (path: string) => {
  return client['/folder-data'].GET({
    params: {
      query: {
        path: decodeURIComponent(path),
      },
    },
  });
};

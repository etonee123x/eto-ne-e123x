import { client } from '@/lib/api/client';
import { cache } from 'react';

export const getFolderData = cache((path: string) => {
  return client['/folder-data'].GET({
    params: {
      query: {
        path: decodeURIComponent(path),
      },
    },
  });
});

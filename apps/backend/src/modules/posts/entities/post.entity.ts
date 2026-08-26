import type { StoredFile } from '@/shared/domain/stored-file/stored-file';

export interface Post {
  _meta: {
    id: string;
    createdAt: number;
    updatedAt: number;
  };

  text: string;
  attachments: Array<StoredFile>;
}

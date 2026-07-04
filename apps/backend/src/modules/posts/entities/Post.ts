import type { StoredFile } from '@/infrastructure/files/entities/StoredFile';

export interface Post {
  _meta: {
    id: string;
    createdAt: number;
    updatedAt: number;
  };

  text: string;
  attachments: Array<StoredFile>;
}

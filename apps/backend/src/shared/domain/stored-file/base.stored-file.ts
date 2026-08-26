import { ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';

export interface StoredFileBase {
  name: string;
  extension: string | null;
  itemType: (typeof ITEM_TYPES)['FILE'];
  _meta: {
    createdAt: number;
    updatedAt: number;
  };
  src: string;
}

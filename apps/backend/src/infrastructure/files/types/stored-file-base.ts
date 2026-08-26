import { ITEM_TYPES } from '@/helpers/folder-data';

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

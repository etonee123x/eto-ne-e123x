import type { FILE_TYPES } from '@/helpers/folderData';
import type { StoredFileBase } from '../types/StoredFileBase';

export interface StoredFileVideo extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['VIDEO'];
  metadata: {
    width: number;
    height: number;
  };
}

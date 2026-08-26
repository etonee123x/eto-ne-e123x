import type { FILE_TYPES } from '@/helpers/folder-data';
import type { StoredFileBase } from '../types/stored-file-base';

export interface StoredFileVideo extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['VIDEO'];
  metadata: {
    width: number;
    height: number;
  };
}

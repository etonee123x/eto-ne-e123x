import type { FILE_TYPES } from '@/helpers/folder-data';
import type { StoredFileBase } from '../types/stored-file-base';

export interface StoredFileImage extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['IMAGE'];
  metadata: {
    width: number;
    height: number;
  };
}

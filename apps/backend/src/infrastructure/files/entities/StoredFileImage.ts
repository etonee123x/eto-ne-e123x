import type { FILE_TYPES } from '@/helpers/folderData';
import type { StoredFileBase } from '../types/StoredFileBase';

export interface StoredFileImage extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['IMAGE'];
  metadata: {
    width: number;
    height: number;
  };
}

import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileBase } from '../types/stored-file-base';

export interface StoredFileVideo extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['VIDEO'];
  metadata: {
    width: number;
    height: number;
  };
}

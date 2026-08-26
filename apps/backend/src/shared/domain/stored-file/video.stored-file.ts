import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFile } from './stored-file';

export interface StoredFileVideo extends StoredFile {
  fileType: (typeof FILE_TYPES)['VIDEO'];
  metadata: {
    width: number;
    height: number;
  };
}

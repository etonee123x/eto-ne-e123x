import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFile } from './stored-file';

export interface StoredFileImage extends StoredFile {
  fileType: (typeof FILE_TYPES)['IMAGE'];
  metadata: {
    width: number;
    height: number;
  };
}

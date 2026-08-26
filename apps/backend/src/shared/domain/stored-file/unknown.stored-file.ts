import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFile } from './stored-file';

export interface StoredFileUnknown extends StoredFile {
  fileType: (typeof FILE_TYPES)['UNKNOWN'];
}

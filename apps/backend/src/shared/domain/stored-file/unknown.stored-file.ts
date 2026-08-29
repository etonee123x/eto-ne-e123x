import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileBase } from './base.stored-file';

export interface StoredFileUnknown extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['UNKNOWN'];
}

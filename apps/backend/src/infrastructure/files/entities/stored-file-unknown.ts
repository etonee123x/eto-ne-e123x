import type { FILE_TYPES } from '@/helpers/folder-data';
import type { StoredFileBase } from '../types/stored-file-base';

export interface StoredFileUnknown extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['UNKNOWN'];
}

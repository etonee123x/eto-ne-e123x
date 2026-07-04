import type { FILE_TYPES } from '@/helpers/folderData';
import type { StoredFileBase } from '../types/StoredFileBase';

export interface StoredFileUnknown extends StoredFileBase {
  fileType: (typeof FILE_TYPES)['UNKNOWN'];
}

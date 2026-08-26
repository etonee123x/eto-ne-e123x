import type { StoredFileUnknown } from '../entities/stored-file-unknown';
import type { StoredFileBase } from '../types/stored-file-base';
import type { FileInspector } from './file-inspector';
import { FILE_TYPES } from '@/helpers/folder-data';

export class UnknownFileInspector implements FileInspector<Omit<StoredFileUnknown, keyof StoredFileBase>> {
  async inspect() {
    return {
      fileType: FILE_TYPES.UNKNOWN,
    };
  }
}

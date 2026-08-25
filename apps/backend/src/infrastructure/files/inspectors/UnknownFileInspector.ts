import type { StoredFileUnknown } from '../entities/StoredFileUnknown';
import type { StoredFileBase } from '../types/StoredFileBase';
import type { FileInspector } from './FileInspector';
import { FILE_TYPES } from '@/helpers/folderData';

export class UnknownFileInspector implements FileInspector<Omit<StoredFileUnknown, keyof StoredFileBase>> {
  async inspect() {
    return {
      fileType: FILE_TYPES.UNKNOWN,
    };
  }
}

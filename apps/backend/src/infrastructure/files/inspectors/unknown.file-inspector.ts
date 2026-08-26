import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileUnknown } from '@/shared/domain/stored-file';
import { FileInspector } from './file-inspector';
import type { FileSource } from '../types/file-source';
import type { FilesStorage } from '../storages/files-storage';

export class UnknownFileInspector extends FileInspector {
  canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }) {
    return parameters.fileType === FILE_TYPES.UNKNOWN;
  }

  async inspect(parameters: {
    fileSource: FileSource;
    key: string;
    filesStorage: FilesStorage;
  }): Promise<StoredFileUnknown> {
    const base = await super.inspect(parameters);

    const specific = {
      fileType: FILE_TYPES.UNKNOWN,
    };

    return {
      ...base,
      ...specific,
    };
  }
}

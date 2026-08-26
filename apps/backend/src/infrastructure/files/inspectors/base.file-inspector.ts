import type { StoredFileBase } from '@/shared/domain/stored-file';
import type { FilesStorage } from '../storages/files-storage';
import type { FileSource } from '../types/file-source';
import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';

export abstract class FileInspectorBase {
  abstract canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }): boolean;

  async inspect(parameters: {
    fileSource: FileSource;
    key: string;
    filesStorage: FilesStorage;
  }): Promise<StoredFileBase> {
    return parameters.filesStorage.getStoredFileBase({ key: parameters.key });
  }
}

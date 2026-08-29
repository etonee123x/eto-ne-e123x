import type { StoredFileBase } from '@/shared/domain/stored-file/base.stored-file';
import type { FilesStorage } from '../storages/files-storage';
import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';

export abstract class FileInspectorBase {
  protected readonly filesStorage: FilesStorage;

  constructor(parameters: { filesStorage: FilesStorage }) {
    this.filesStorage = parameters.filesStorage;
  }

  abstract canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }): boolean;

  protected async inspect(parameters: { key: string }): Promise<StoredFileBase> {
    return this.filesStorage.getStoredFileBase({ key: parameters.key });
  }
}

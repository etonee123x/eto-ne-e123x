import type { StoredFileBase } from '@/shared/domain/stored-file/base.stored-file';
import type { FilesStorage } from '../storages/files-storage';
import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileSource } from '../types/stored-file-source';

export abstract class FileInspectorBase {
  private filesStorage: FilesStorage;

  constructor(parameters: { filesStorage: FilesStorage }) {
    this.filesStorage = parameters.filesStorage;
  }

  abstract canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }): boolean;

  protected async inspect(parameters: { storedFileSource: StoredFileSource }): Promise<StoredFileBase> {
    const key = await parameters.storedFileSource.getPath();
    return this.filesStorage.getStoredFileBase({ key });
  }
}

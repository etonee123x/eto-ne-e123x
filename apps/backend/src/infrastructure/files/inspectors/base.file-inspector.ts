import type { StoredFileBase } from '@/shared/domain/stored-file';
import type { FilesStorage } from '../storages/files-storage';
import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { FileSource } from '../types/file-source';

export abstract class FileInspectorBase {
  private filesStorage: FilesStorage;

  constructor(parameters: { filesStorage: FilesStorage }) {
    this.filesStorage = parameters.filesStorage;
  }

  abstract canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }): boolean;

  protected async inspect(parameters: { fileSource: FileSource }): Promise<StoredFileBase> {
    const key = await parameters.fileSource.getPath();
    return this.filesStorage.getStoredFileBase({ key });
  }
}

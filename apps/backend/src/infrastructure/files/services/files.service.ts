import type { StoredFile } from '@/shared/domain/stored-file';
import type { FileInspector } from '../inspectors/file-inspector';
import type { FilesStorage } from '../storages/files-storage';

export class FilesService {
  private readonly filesStorage: FilesStorage;
  private readonly fileInspector: FileInspector;

  constructor(parameters: { filesStorage: FilesStorage; fileInspector: FileInspector }) {
    this.filesStorage = parameters.filesStorage;
    this.fileInspector = parameters.fileInspector;
  }

  async upload(parameters: { buffer: Buffer; key: string }): Promise<StoredFile> {
    await this.filesStorage.put(parameters);

    const storedFile = await this.getStoredFile({ key: parameters.key });

    return storedFile;
  }

  async delete(parameters: { key: string }): Promise<StoredFile> {
    const storedFile = await this.getStoredFile(parameters);

    await this.filesStorage.delete(parameters);

    return storedFile;
  }

  async exists(parameters: { key: string }): Promise<boolean> {
    return this.filesStorage.exists(parameters);
  }

  async getStoredFile(parameters: { key: string }): Promise<StoredFile> {
    return this.fileInspector.inspect(parameters);
  }
}

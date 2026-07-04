import type { StoredFile } from '../entities/StoredFile';
import type { FileInspectorRouter } from '../inspectors/FileInspectorRouter';
import type { FilesStorage } from '../storages/FilesStorage';

export class FilesService {
  private readonly filesStorage: FilesStorage;
  private readonly fileInspectorRouter: FileInspectorRouter;

  constructor(parameters: { filesStorage: FilesStorage; fileInspectorRouter: FileInspectorRouter }) {
    this.filesStorage = parameters.filesStorage;
    this.fileInspectorRouter = parameters.fileInspectorRouter;
  }

  async upload(parameters: { buffer: Buffer; key: string }): Promise<StoredFile> {
    await this.filesStorage.put(parameters);

    const storedFile = await this.getStoredFile(parameters);

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
    const storedFileBase = await this.filesStorage.getStoredFileBase(parameters);

    const buffer = await this.filesStorage.getBuffer(parameters);

    const fileSource = {
      getBuffer: async () => {
        return buffer;
      },
      getPath: async () => {
        return parameters.key;
      },
    };

    const inspectedMetadata = await this.fileInspectorRouter.inspect({ fileSource });

    return {
      ...storedFileBase,
      ...inspectedMetadata,
    };
  }
}

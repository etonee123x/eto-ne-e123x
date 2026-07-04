import type { FilesStorage } from '../storages/FilesStorage';

export class FilesService {
  private readonly filesStorage: FilesStorage;

  constructor(parameters: { filesStorage: FilesStorage }) {
    this.filesStorage = parameters.filesStorage;
  }

  async upload(parameters: { file: File; key: string }) {}
  async delete(parameters: { key: string }) {}
  async get(parameters: { key: string }) {}
  async exists(parameters: { key: string }) {
    return this.filesStorage.exists(parameters);
  }
}

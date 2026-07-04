import type { FilesStorage } from './FilesStorage';
import fsPromises from 'node:fs/promises';

export class FsFilesStorage implements FilesStorage {
  async put(...[parameters]: Parameters<FilesStorage['put']>) {
    await fsPromises.writeFile(parameters.key, parameters.buffer);
  }
  async get(...[parameters]: Parameters<FilesStorage['get']>) {
    return await fsPromises.readFile(parameters.key);
  }
  async delete(...[parameters]: Parameters<FilesStorage['delete']>) {
    await fsPromises.unlink(parameters.key);
  }
  async exists(...[parameters]: Parameters<FilesStorage['exists']>) {
    try {
      await fsPromises.access(parameters.key);
      return true;
    } catch {
      return false;
    }
  }
}

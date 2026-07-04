import nodePath from 'node:path';
import fsPromises from 'node:fs/promises';

import type { FilesStorage } from './FilesStorage';
import { ITEM_TYPES } from '@/helpers/folderData';
import type { FilesLocation } from '../locations/FilesLocation';

export class FsFilesStorage implements FilesStorage {
  private readonly filesLocation: FilesLocation;

  constructor(parameters: { filesLocation: FilesLocation }) {
    this.filesLocation = parameters.filesLocation;
  }

  private getPath(name: string) {
    return nodePath.join(this.filesLocation.fs, name);
  }

  async getStream(parameters: { key: string }) {
    const fileHandle = await fsPromises.open(this.getPath(parameters.key), 'r');
    return fileHandle.createReadStream();
  }

  async getBuffer(parameters: { key: string }) {
    return fsPromises.readFile(this.getPath(parameters.key));
  }

  async getStoredFileBase(parameters: { key: string }) {
    const statAwaited = await fsPromises.stat(this.getPath(parameters.key));

    const parsedPath = nodePath.parse(this.getPath(parameters.key));

    const source = nodePath.join(this.filesLocation.src, parameters.key);

    const commonMetadata = {
      name: parsedPath.base,
      ext: parsedPath.ext,
      itemType: ITEM_TYPES.FILE,
      _meta: {
        createdAt: statAwaited.birthtimeMs,
        updatedAt: statAwaited.mtimeMs,
      },
      src: source,
    };

    return commonMetadata;
  }

  async put(...[parameters]: Parameters<FilesStorage['put']>) {
    await fsPromises.writeFile(this.getPath(parameters.key), parameters.buffer);
  }

  async delete(...[parameters]: Parameters<FilesStorage['delete']>) {
    return fsPromises.unlink(this.getPath(parameters.key));
  }

  async exists(...[parameters]: Parameters<FilesStorage['exists']>) {
    try {
      await fsPromises.access(this.getPath(parameters.key));
      return true;
    } catch {
      return false;
    }
  }
}

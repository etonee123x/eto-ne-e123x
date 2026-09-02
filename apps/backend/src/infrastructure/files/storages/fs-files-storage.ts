import nodePath from 'node:path';
import fsPromises from 'node:fs/promises';

import type { FilesStorage } from './files-storage';
import { ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { FilesLocation } from '../locations/files-location';
import { resolveSafePath } from '@/utils/safe-path';

export class FsFilesStorage implements FilesStorage {
  private readonly filesLocation: FilesLocation;

  constructor(parameters: { filesLocation: FilesLocation }) {
    this.filesLocation = parameters.filesLocation;
  }

  getPath(parameters: { key: string }) {
    return resolveSafePath(this.filesLocation.fs, parameters.key);
  }

  async getStream(parameters: { key: string }) {
    const path = this.getPath(parameters);
    const fileHandle = await fsPromises.open(path, 'r');
    return fileHandle.createReadStream();
  }

  async getBuffer(parameters: { key: string }) {
    const path = this.getPath(parameters);
    return fsPromises.readFile(path);
  }

  async getStoredFileBase(parameters: { key: string }) {
    const path = this.getPath(parameters);
    const statAwaited = await fsPromises.stat(path);

    const parsedPath = nodePath.parse(path);

    const source = nodePath.posix.join(this.filesLocation.src, parameters.key);

    const commonMetadata = {
      name: parsedPath.base,
      extension: parsedPath.ext.slice(1) || null,
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
    const path = this.getPath(parameters);
    await fsPromises.writeFile(path, parameters.buffer);
  }

  async delete(...[parameters]: Parameters<FilesStorage['delete']>) {
    const path = this.getPath(parameters);
    return fsPromises.unlink(path);
  }

  async exists(...[parameters]: Parameters<FilesStorage['exists']>) {
    try {
      const path = this.getPath(parameters);
      await fsPromises.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

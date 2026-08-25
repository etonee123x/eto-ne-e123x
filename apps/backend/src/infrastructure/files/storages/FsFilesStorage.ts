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

  private getPath(parameters: { key: string }) {
    return nodePath.join(this.filesLocation.fs, parameters.key);
  }

  async getStream(parameters: { key: string }) {
    const fileHandle = await fsPromises.open(this.getPath(parameters), 'r');
    return fileHandle.createReadStream();
  }

  async getBuffer(parameters: { key: string }) {
    return fsPromises.readFile(this.getPath(parameters));
  }

  async getStoredFileBase(parameters: { key: string }) {
    const statAwaited = await fsPromises.stat(this.getPath(parameters));

    const parsedPath = nodePath.parse(this.getPath(parameters));

    // console.log({
    //   src: this.filesLocation.src,
    //   fs: this.filesLocation.fs,
    //   key: parameters.key,
    //   res: parameters.key.replace(this.filesLocation.fs, ''),
    // });

    const source = [this.filesLocation.src, parameters.key.replace(this.filesLocation.fs, '')].join('');

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
    await fsPromises.writeFile(this.getPath(parameters), parameters.buffer);
  }

  async delete(...[parameters]: Parameters<FilesStorage['delete']>) {
    return fsPromises.unlink(this.getPath(parameters));
  }

  async exists(...[parameters]: Parameters<FilesStorage['exists']>) {
    try {
      await fsPromises.access(this.getPath(parameters));
      return true;
    } catch {
      return false;
    }
  }
}

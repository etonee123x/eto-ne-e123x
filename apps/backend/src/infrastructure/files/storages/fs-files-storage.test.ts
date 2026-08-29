import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { FilesLocation } from '@/infrastructure/files/locations/files-location';
import { FsFilesStorage } from '@/infrastructure/files/storages/fs-files-storage';

describe('FsFilesStorage', () => {
  const temporaryDirectories: Array<string> = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.map(async (directory) => {
        await fs.rm(directory, { recursive: true, force: true });
      }),
    );
    temporaryDirectories.length = 0;
  });

  it('writes, reads, checks existence and deletes file', async () => {
    const baseDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-storage-'));
    temporaryDirectories.push(baseDirectory);

    const filesLocation = new FilesLocation({ fs: baseDirectory, src: '/content' });
    const storage = new FsFilesStorage({ filesLocation });

    const key = 'folder/test.txt';
    const absolutePath = path.join(baseDirectory, key);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await storage.put({ key, buffer: Buffer.from('hello') });

    await expect(storage.exists({ key })).resolves.toBe(true);
    await expect(storage.getBuffer({ key })).resolves.toEqual(Buffer.from('hello'));

    await storage.delete({ key });

    await expect(storage.exists({ key })).resolves.toBe(false);
  });

  it('returns stored file base metadata', async () => {
    const baseDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-storage-'));
    temporaryDirectories.push(baseDirectory);

    const filesLocation = new FilesLocation({ fs: baseDirectory, src: '/content' });
    const storage = new FsFilesStorage({ filesLocation });

    const key = 'images/photo.jpg';
    const absolutePath = path.join(baseDirectory, key);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, Buffer.from('x'));

    const storedFileBase = await storage.getStoredFileBase({ key });

    expect(storedFileBase.name).toBe('photo.jpg');
    expect(storedFileBase.extension).toBe('jpg');
    expect(storedFileBase.itemType).toBe(ITEM_TYPES.FILE);
    expect(storedFileBase.src).toBe('/contentimages/photo.jpg');
    expect(storedFileBase._meta.createdAt).toBeTypeOf('number');
    expect(storedFileBase._meta.updatedAt).toBeTypeOf('number');
  });

  it('rejects keys escaping storage directory', async () => {
    const baseDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-storage-'));
    temporaryDirectories.push(baseDirectory);

    const filesLocation = new FilesLocation({ fs: baseDirectory, src: '/content' });
    const storage = new FsFilesStorage({ filesLocation });

    await expect(storage.getBuffer({ key: '../../etc/passwd' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

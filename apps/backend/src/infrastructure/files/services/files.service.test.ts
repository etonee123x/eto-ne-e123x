import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { FILE_TYPES, ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { FileInspectorCacheService } from '@/infrastructure/files/services/file-inspector-cache.service';
import { FilesService } from '@/infrastructure/files/services/files.service';

describe('FilesService', () => {
  it('reuses disk inspection cache until file state changes', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'file-inspection-'));
    const filePath = path.join(directory, 'a.bin');
    const cacheDirectory = path.join(directory, 'cache');
    await fs.writeFile(filePath, 'first');

    const storedFile = {
      name: 'a.bin',
      extension: 'bin',
      itemType: ITEM_TYPES.FILE,
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/content/a.bin',
      fileType: FILE_TYPES.UNKNOWN,
    };
    const fileInspector = { inspect: vi.fn().mockResolvedValue(storedFile) };
    const service = new FilesService({
      filesStorage: { getPath: vi.fn().mockReturnValue(filePath) } as never,
      fileInspector: fileInspector as never,
      fileInspectorCache: new FileInspectorCacheService({ directory: cacheDirectory }),
    });

    try {
      await service.getFileInspection({ key: 'a.bin' });
      await service.getFileInspection({ key: 'a.bin' });

      expect(fileInspector.inspect).toHaveBeenCalledTimes(1);

      await fs.writeFile(filePath, 'second file state');
      await service.getFileInspection({ key: 'a.bin' });

      expect(fileInspector.inspect).toHaveBeenCalledTimes(2);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  it('upload writes file and returns inspected metadata', async () => {
    const buffer = Buffer.from('abc');
    const storedFile = {
      name: 'a.bin',
      extension: 'bin',
      itemType: ITEM_TYPES.FILE,
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/uploads/a.bin',
      fileType: FILE_TYPES.UNKNOWN,
    };

    const filesStorage = {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      getPath: vi.fn(),
      getStoredFileBase: vi.fn(),
      getBuffer: vi.fn(),
      getStream: vi.fn(),
    };

    const fileInspector = {
      inspect: vi.fn().mockResolvedValue(storedFile),
    };

    const filesService = new FilesService({
      filesStorage: filesStorage,
      fileInspector: fileInspector as never,
      // Explicit dependency preserves the production constructor contract in non-cache tests.
      fileInspectorCache: new FileInspectorCacheService(),
    });

    const result = await filesService.upload({ key: 'a.bin', buffer });

    expect(filesStorage.put).toHaveBeenCalledWith({ key: 'a.bin', buffer });
    expect(fileInspector.inspect).toHaveBeenCalledWith({ key: 'a.bin' });
    expect(result).toEqual(storedFile);
  });

  it('delete returns stored file and delegates delete call', async () => {
    const filesStorage = {
      put: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      getPath: vi.fn(),
      getStoredFileBase: vi.fn(),
      getBuffer: vi.fn(),
      getStream: vi.fn(),
    };

    const fileInspector = {
      inspect: vi.fn().mockResolvedValue({
        name: 'a.bin',
        extension: 'bin',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/uploads/a.bin',
        fileType: FILE_TYPES.UNKNOWN,
      }),
    };

    const filesService = new FilesService({
      filesStorage: filesStorage,
      fileInspector: fileInspector as never,
      // Explicit dependency preserves the production constructor contract in non-cache tests.
      fileInspectorCache: new FileInspectorCacheService(),
    });

    const storedFile = await filesService.delete({ key: 'a.bin' });

    expect(filesStorage.delete).toHaveBeenCalledWith({ key: 'a.bin' });
    expect(fileInspector.inspect).toHaveBeenCalledWith({ key: 'a.bin' });
    expect(storedFile.fileType).toBe(FILE_TYPES.UNKNOWN);
  });

  it('exists delegates to storage', async () => {
    const filesStorage = {
      put: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      getPath: vi.fn(),
      getStoredFileBase: vi.fn(),
      getBuffer: vi.fn(),
      getStream: vi.fn(),
    };

    const fileInspector = {
      inspect: vi.fn(),
    };

    const filesService = new FilesService({
      filesStorage: filesStorage,
      fileInspector: fileInspector as never,
      // Explicit dependency preserves the production constructor contract in non-cache tests.
      fileInspectorCache: new FileInspectorCacheService(),
    });

    await expect(filesService.exists({ key: 'missing.bin' })).resolves.toBe(false);
    expect(filesStorage.exists).toHaveBeenCalledWith({ key: 'missing.bin' });
  });
});

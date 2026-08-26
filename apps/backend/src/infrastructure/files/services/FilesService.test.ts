import { describe, expect, it, vi } from 'vitest';

import { FILE_TYPES, ITEM_TYPES } from '@/helpers/folderData';
import { FilesService } from '@/infrastructure/files/services/FilesService';

describe('FilesService', () => {
  it('upload writes file and returns inspected metadata', async () => {
    const buffer = Buffer.from('abc');

    const filesStorage = {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      getStoredFileBase: vi.fn().mockResolvedValue({
        name: 'a.bin',
        extension: 'bin',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/uploads/a.bin',
      }),
      getBuffer: vi.fn().mockResolvedValue(buffer),
      getStream: vi.fn(),
    };

    const fileInspectorRouter = {
      inspect: vi.fn().mockResolvedValue({
        fileType: FILE_TYPES.UNKNOWN,
      }),
    };

    const filesService = new FilesService({
      filesStorage: filesStorage,
      fileInspectorRouter: fileInspectorRouter as never,
    });

    const storedFile = await filesService.upload({ key: 'a.bin', buffer });

    expect(filesStorage.put).toHaveBeenCalledWith({ key: 'a.bin', buffer });
    expect(filesStorage.getStoredFileBase).toHaveBeenCalledWith(expect.objectContaining({ key: 'a.bin' }));
    expect(filesStorage.getBuffer).toHaveBeenCalledWith(expect.objectContaining({ key: 'a.bin' }));
    expect(fileInspectorRouter.inspect).toHaveBeenCalledOnce();
    expect(storedFile).toEqual({
      name: 'a.bin',
      extension: 'bin',
      itemType: ITEM_TYPES.FILE,
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/uploads/a.bin',
      fileType: FILE_TYPES.UNKNOWN,
    });
  });

  it('delete returns stored file and delegates delete call', async () => {
    const filesStorage = {
      put: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      getStoredFileBase: vi.fn().mockResolvedValue({
        name: 'a.bin',
        extension: 'bin',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/uploads/a.bin',
      }),
      getBuffer: vi.fn().mockResolvedValue(Buffer.from('abc')),
      getStream: vi.fn(),
    };

    const fileInspectorRouter = {
      inspect: vi.fn().mockResolvedValue({ fileType: FILE_TYPES.UNKNOWN }),
    };

    const filesService = new FilesService({
      filesStorage: filesStorage,
      fileInspectorRouter: fileInspectorRouter as never,
    });

    const storedFile = await filesService.delete({ key: 'a.bin' });

    expect(filesStorage.delete).toHaveBeenCalledWith({ key: 'a.bin' });
    expect(storedFile.fileType).toBe(FILE_TYPES.UNKNOWN);
  });

  it('exists delegates to storage', async () => {
    const filesStorage = {
      put: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      getStoredFileBase: vi.fn(),
      getBuffer: vi.fn(),
      getStream: vi.fn(),
    };

    const fileInspectorRouter = {
      inspect: vi.fn(),
    };

    const filesService = new FilesService({
      filesStorage: filesStorage,
      fileInspectorRouter: fileInspectorRouter as never,
    });

    await expect(filesService.exists({ key: 'missing.bin' })).resolves.toBe(false);
    expect(filesStorage.exists).toHaveBeenCalledWith({ key: 'missing.bin' });
  });
});

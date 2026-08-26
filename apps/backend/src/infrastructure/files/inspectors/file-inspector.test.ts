import { describe, expect, it, vi } from 'vitest';

vi.mock('file-type', () => {
  return {
    fileTypeFromBuffer: vi.fn(),
  };
});

import { fileTypeFromBuffer } from 'file-type';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { FileInspector } from '@/infrastructure/files/inspectors/file-inspector';

describe('FileInspector', () => {
  it('routes to audio inspector when extension maps to audio', async () => {
    const mockedFileTypeFromBuffer = vi.mocked(fileTypeFromBuffer);
    mockedFileTypeFromBuffer.mockResolvedValue({ ext: 'mp3', mime: 'audio/mpeg' });

    const storedFile = {
      name: 'a.mp3',
      extension: 'mp3',
      itemType: 'FILE' as const,
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/content/a.mp3',
      fileType: FILE_TYPES.AUDIO,
      metadata: { duration: 1 },
    };

    const audioFileInspector = {
      canInspect: vi.fn().mockReturnValue(true),
      inspect: vi.fn().mockResolvedValue(storedFile),
    };
    const imageFileInspector = { canInspect: vi.fn().mockReturnValue(false), inspect: vi.fn() };
    const videoFileInspector = { canInspect: vi.fn().mockReturnValue(false), inspect: vi.fn() };
    const unknownFileInspector = { canInspect: vi.fn().mockReturnValue(false), inspect: vi.fn() };
    const filesStorage = {
      getBuffer: vi.fn().mockResolvedValue(Buffer.from('audio')),
    };

    const router = new FileInspector({
      fileInspectors: {
        audioFileInspector: audioFileInspector,
        imageFileInspector: imageFileInspector,
        videoFileInspector: videoFileInspector,
        unknownFileInspector: unknownFileInspector,
      } as never,
      filesStorage: filesStorage as never,
    });

    const result = await router.inspect({ key: '/tmp/a.mp3' });

    expect(filesStorage.getBuffer).toHaveBeenCalledWith({ key: '/tmp/a.mp3' });
    expect(audioFileInspector.canInspect).toHaveBeenCalledWith({ fileType: FILE_TYPES.AUDIO });
    expect(audioFileInspector.inspect).toHaveBeenCalledWith({
      storedFileSource: expect.objectContaining({
        getBuffer: expect.any(Function),
        getPath: expect.any(Function),
      }),
    });
    expect(result).toEqual(storedFile);
  });

  it('routes to unknown inspector when file type is not detected', async () => {
    const mockedFileTypeFromBuffer = vi.mocked(fileTypeFromBuffer);
    mockedFileTypeFromBuffer.mockResolvedValue(undefined);

    const unknownFileInspector = {
      canInspect: vi.fn().mockReturnValue(true),
      inspect: vi.fn().mockResolvedValue({
        name: 'a.bin',
        extension: 'bin',
        itemType: 'FILE' as const,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/content/a.bin',
        fileType: FILE_TYPES.UNKNOWN,
      }),
    };
    const filesStorage = {
      getBuffer: vi.fn().mockResolvedValue(Buffer.from('unknown')),
    };

    const router = new FileInspector({
      fileInspectors: {
        audioFileInspector: { canInspect: vi.fn().mockReturnValue(false), inspect: vi.fn() },
        imageFileInspector: { canInspect: vi.fn().mockReturnValue(false), inspect: vi.fn() },
        videoFileInspector: { canInspect: vi.fn().mockReturnValue(false), inspect: vi.fn() },
        unknownFileInspector: unknownFileInspector,
      } as never,

      filesStorage: filesStorage as never,
    });

    const result = await router.inspect({ key: '/tmp/a.bin' });

    expect(unknownFileInspector.canInspect).toHaveBeenCalledWith({ fileType: FILE_TYPES.UNKNOWN });
    expect(unknownFileInspector.inspect).toHaveBeenCalledWith({
      storedFileSource: expect.objectContaining({
        getBuffer: expect.any(Function),
        getPath: expect.any(Function),
      }),
    });
    expect(result).toEqual({
      name: 'a.bin',
      extension: 'bin',
      itemType: 'FILE',
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/content/a.bin',
      fileType: FILE_TYPES.UNKNOWN,
    });
  });
});

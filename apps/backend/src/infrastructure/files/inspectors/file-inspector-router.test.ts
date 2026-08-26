import { describe, expect, it, vi } from 'vitest';

vi.mock('file-type', () => {
  return {
    fileTypeFromBuffer: vi.fn(),
  };
});

import { fileTypeFromBuffer } from 'file-type';
import { FILE_TYPES } from '@/helpers/folder-data';
import { FileInspectorRouter } from '@/infrastructure/files/inspectors/file-inspector-router';

describe('FileInspectorRouter', () => {
  it('routes to audio inspector when extension maps to audio', async () => {
    const mockedFileTypeFromBuffer = vi.mocked(fileTypeFromBuffer);
    mockedFileTypeFromBuffer.mockResolvedValue({ ext: 'mp3', mime: 'audio/mpeg' });

    const audioFileInspector = {
      inspect: vi.fn().mockResolvedValue({ fileType: FILE_TYPES.AUDIO, metadata: { duration: 1 } }),
    };
    const imageFileInspector = { inspect: vi.fn() };
    const videoFileInspector = { inspect: vi.fn() };
    const unknownFileInspector = { inspect: vi.fn() };

    const router = new FileInspectorRouter({
      audioFileInspector: audioFileInspector,
      imageFileInspector: imageFileInspector,
      videoFileInspector: videoFileInspector,
      unknownFileInspector: unknownFileInspector,
    });

    const fileSource = {
      getBuffer: vi.fn().mockResolvedValue(Buffer.from('audio')),
      getPath: vi.fn().mockResolvedValue('/tmp/a.mp3'),
    };

    const result = await router.inspect({ fileSource });

    expect(audioFileInspector.inspect).toHaveBeenCalledWith({ fileSource });
    expect(result).toEqual({ fileType: FILE_TYPES.AUDIO, metadata: { duration: 1 } });
  });

  it('routes to unknown inspector when file type is not detected', async () => {
    const mockedFileTypeFromBuffer = vi.mocked(fileTypeFromBuffer);
    mockedFileTypeFromBuffer.mockResolvedValue(undefined);

    const unknownFileInspector = {
      inspect: vi.fn().mockResolvedValue({ fileType: FILE_TYPES.UNKNOWN }),
    };

    const router = new FileInspectorRouter({
      audioFileInspector: { inspect: vi.fn() },
      imageFileInspector: { inspect: vi.fn() },
      videoFileInspector: { inspect: vi.fn() },
      unknownFileInspector: unknownFileInspector,
    });

    const fileSource = {
      getBuffer: vi.fn().mockResolvedValue(Buffer.from('unknown')),
      getPath: vi.fn().mockResolvedValue('/tmp/a.bin'),
    };

    const result = await router.inspect({ fileSource });

    expect(unknownFileInspector.inspect).toHaveBeenCalledWith({ fileSource });
    expect(result).toEqual({ fileType: FILE_TYPES.UNKNOWN });
  });
});

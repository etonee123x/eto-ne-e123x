import { describe, expect, it, vi } from 'vitest';

vi.mock('node:child_process', () => {
  return {
    execFile: vi.fn(),
  };
});

vi.mock('ffprobe-static', () => {
  return {
    default: { path: '/mock/ffprobe' },
  };
});

import { execFile } from 'node:child_process';
import { FILE_TYPES, ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { VideoFileInspector } from '@/infrastructure/files/inspectors/video.file-inspector';

describe('VideoFileInspector', () => {
  it('extracts video stream dimensions', async () => {
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation((...arguments_) => {
      const callback = arguments_[2] as (error: Error | null, out: string) => void;
      callback(null, JSON.stringify({ streams: [{ width: 1920, height: 1080 }] }));
      return {} as never;
    });

    const filesStorage = {
      getStoredFileBase: vi.fn().mockResolvedValue({
        name: 'video.mp4',
        extension: 'mp4',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/content/video.mp4',
      }),
    };
    const inspector = new VideoFileInspector({ filesStorage: filesStorage as never });

    const result = await inspector.inspect({
      storedFileSource: {
        getBuffer: async () => {
          return Buffer.from('video');
        },
        getPath: async () => {
          return '/tmp/video.mp4';
        },
      },
    });

    expect(result).toEqual({
      name: 'video.mp4',
      extension: 'mp4',
      itemType: ITEM_TYPES.FILE,
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/content/video.mp4',
      fileType: FILE_TYPES.VIDEO,
      metadata: {
        width: 1920,
        height: 1080,
      },
    });
  });

  it('throws when ffprobe reports error', async () => {
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation((...arguments_) => {
      const callback = arguments_[2] as (error: Error | null, out: string) => void;
      callback(new Error('spawn fail'), '');
      return {} as never;
    });

    const filesStorage = {
      getStoredFileBase: vi.fn().mockResolvedValue({
        name: 'video.mp4',
        extension: 'mp4',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/content/video.mp4',
      }),
    };
    const inspector = new VideoFileInspector({ filesStorage: filesStorage as never });

    await expect(
      inspector.inspect({
        storedFileSource: {
          getBuffer: async () => {
            return Buffer.from('video');
          },
          getPath: async () => {
            return '/tmp/video.mp4';
          },
        },
      }),
    ).rejects.toThrow('ffprobe error: spawn fail');
  });

  it('throws when ffprobe output is invalid', async () => {
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation((...arguments_) => {
      const callback = arguments_[2] as (error: Error | null, out: string) => void;
      callback(null, JSON.stringify({ streams: 'broken' }));
      return {} as never;
    });

    const filesStorage = {
      getStoredFileBase: vi.fn().mockResolvedValue({
        name: 'video.mp4',
        extension: 'mp4',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/content/video.mp4',
      }),
    };
    const inspector = new VideoFileInspector({ filesStorage: filesStorage as never });

    await expect(
      inspector.inspect({
        storedFileSource: {
          getBuffer: async () => {
            return Buffer.from('video');
          },
          getPath: async () => {
            return '/tmp/video.mp4';
          },
        },
      }),
    ).rejects.toThrow('Invalid ffprobe output');
  });

  it('throws when video stream is missing', async () => {
    const mockedExecFile = vi.mocked(execFile);
    mockedExecFile.mockImplementation((...arguments_) => {
      const callback = arguments_[2] as (error: Error | null, out: string) => void;
      callback(null, JSON.stringify({ streams: [{ codec_name: 'aac' }] }));
      return {} as never;
    });

    const filesStorage = {
      getStoredFileBase: vi.fn().mockResolvedValue({
        name: 'video.mp4',
        extension: 'mp4',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/content/video.mp4',
      }),
    };
    const inspector = new VideoFileInspector({ filesStorage: filesStorage as never });

    await expect(
      inspector.inspect({
        storedFileSource: {
          getBuffer: async () => {
            return Buffer.from('video');
          },
          getPath: async () => {
            return '/tmp/video.mp4';
          },
        },
      }),
    ).rejects.toThrow('No video stream found');
  });
});

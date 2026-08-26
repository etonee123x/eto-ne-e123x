import { describe, expect, it, vi } from 'vitest';

vi.mock('music-metadata', () => {
  return {
    parseBuffer: vi.fn(),
  };
});

import { parseBuffer } from 'music-metadata';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { AudioFileInspector } from '@/infrastructure/files/inspectors/audio-file-inspector';

describe('AudioFileInspector', () => {
  it('maps metadata from music-metadata response', async () => {
    const mockedParseBuffer = vi.mocked(parseBuffer);
    mockedParseBuffer.mockResolvedValue({
      format: { duration: 2.5, bitrate: 320_000 },
      common: {
        album: 'Album',
        artists: ['Artist'],
        bpm: 120,
        year: 2020,
      },
    } as never);

    const inspector = new AudioFileInspector();

    const result = await inspector.inspect({
      fileSource: {
        getBuffer: async () => {
          return Buffer.from('audio');
        },
        getPath: async () => {
          return '/tmp/audio.mp3';
        },
      },
    });

    expect(result).toEqual({
      fileType: FILE_TYPES.AUDIO,
      metadata: {
        duration: 2500,
        bitrate: 320,
        album: 'Album',
        artists: ['Artist'],
        bpm: 120,
        year: 2020,
      },
    });
  });

  it('fills defaults when metadata is missing', async () => {
    const mockedParseBuffer = vi.mocked(parseBuffer);
    mockedParseBuffer.mockResolvedValue({
      format: {},
      common: {},
    } as never);

    const inspector = new AudioFileInspector();

    const result = await inspector.inspect({
      fileSource: {
        getBuffer: async () => {
          return Buffer.from('audio');
        },
        getPath: async () => {
          return '/tmp/audio.mp3';
        },
      },
    });

    expect(result).toEqual({
      fileType: FILE_TYPES.AUDIO,
      metadata: {
        duration: 0,
        bitrate: null,
        album: null,
        artists: [],
        bpm: null,
        year: null,
      },
    });
  });
});

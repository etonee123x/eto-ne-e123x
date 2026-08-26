import { describe, expect, it, vi } from 'vitest';

vi.mock('sharp', () => {
  return {
    default: vi.fn(),
  };
});

import sharp from 'sharp';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { ImageFileInspector } from '@/infrastructure/files/inspectors/image-file-inspector';

describe('ImageFileInspector', () => {
  it('returns width and height from sharp metadata', async () => {
    const metadata = vi.fn().mockResolvedValue({ width: 640, height: 480 });
    vi.mocked(sharp).mockReturnValue({ metadata } as never);

    const inspector = new ImageFileInspector();

    const result = await inspector.inspect({
      fileSource: {
        getBuffer: async () => {
          return Buffer.from('image');
        },
        getPath: async () => {
          return '/tmp/image.png';
        },
      },
    });

    expect(result).toEqual({
      fileType: FILE_TYPES.IMAGE,
      metadata: {
        width: 640,
        height: 480,
      },
    });
    expect(metadata).toHaveBeenCalledOnce();
  });
});

import { describe, expect, it, vi } from 'vitest';

vi.mock('sharp', () => {
  return {
    default: vi.fn(),
  };
});

import sharp from 'sharp';
import { FILE_TYPES, ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { ImageFileInspector } from '@/infrastructure/files/inspectors/image.file-inspector';

describe('ImageFileInspector', () => {
  it('returns width and height from sharp metadata', async () => {
    const metadata = vi.fn().mockResolvedValue({ width: 640, height: 480 });
    vi.mocked(sharp).mockReturnValue({ metadata } as never);

    const filesStorage = {
      getStoredFileBase: vi.fn().mockResolvedValue({
        name: 'image.png',
        extension: 'png',
        itemType: ITEM_TYPES.FILE,
        _meta: { createdAt: 1, updatedAt: 2 },
        src: '/content/image.png',
      }),
    };
    const inspector = new ImageFileInspector({ filesStorage: filesStorage as never });

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
      name: 'image.png',
      extension: 'png',
      itemType: ITEM_TYPES.FILE,
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/content/image.png',
      fileType: FILE_TYPES.IMAGE,
      metadata: {
        width: 640,
        height: 480,
      },
    });
    expect(metadata).toHaveBeenCalledOnce();
  });
});

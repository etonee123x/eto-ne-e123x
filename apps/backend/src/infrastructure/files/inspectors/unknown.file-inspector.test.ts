import { describe, expect, it } from 'vitest';

import { FILE_TYPES, ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { UnknownFileInspector } from '@/infrastructure/files/inspectors/unknown.file-inspector';

describe('UnknownFileInspector', () => {
  it('returns unknown file type', async () => {
    const inspector = new UnknownFileInspector();
    const filesStorage = {
      getStoredFileBase: async () => {
        return {
          name: 'unknown.bin',
          extension: 'bin',
          itemType: ITEM_TYPES.FILE,
          _meta: { createdAt: 1, updatedAt: 2 },
          src: '/content/unknown.bin',
        };
      },
    };

    await expect(
      inspector.inspect({
        key: '/tmp/unknown.bin',
        filesStorage: filesStorage as never,
        fileSource: {
          getBuffer: async () => {
            return Buffer.from('unknown');
          },
          getPath: async () => {
            return '/tmp/unknown.bin';
          },
        },
      }),
    ).resolves.toEqual({
      name: 'unknown.bin',
      extension: 'bin',
      itemType: ITEM_TYPES.FILE,
      _meta: { createdAt: 1, updatedAt: 2 },
      src: '/content/unknown.bin',
      fileType: FILE_TYPES.UNKNOWN,
    });
  });
});

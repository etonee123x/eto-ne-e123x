import { describe, expect, it } from 'vitest';

import { FILE_TYPES } from '@/helpers/folderData';
import { UnknownFileInspector } from '@/infrastructure/files/inspectors/UnknownFileInspector';

describe('UnknownFileInspector', () => {
  it('returns unknown file type', async () => {
    const inspector = new UnknownFileInspector();

    await expect(inspector.inspect()).resolves.toEqual({ fileType: FILE_TYPES.UNKNOWN });
  });
});

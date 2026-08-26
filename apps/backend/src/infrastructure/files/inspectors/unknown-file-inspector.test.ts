import { describe, expect, it } from 'vitest';

import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { UnknownFileInspector } from '@/infrastructure/files/inspectors/unknown-file-inspector';

describe('UnknownFileInspector', () => {
  it('returns unknown file type', async () => {
    const inspector = new UnknownFileInspector();

    await expect(inspector.inspect()).resolves.toEqual({ fileType: FILE_TYPES.UNKNOWN });
  });
});

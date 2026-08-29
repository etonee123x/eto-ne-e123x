import { describe, expect, it } from 'vitest';

import { FILE_TYPES, ITEM_TYPES } from './file-types.domain';

describe('file-types.domain', () => {
  it('exposes file and item type dictionaries', () => {
    expect(FILE_TYPES.AUDIO).toBe('AUDIO');
    expect(FILE_TYPES.IMAGE).toBe('IMAGE');
    expect(FILE_TYPES.VIDEO).toBe('VIDEO');
    expect(FILE_TYPES.UNKNOWN).toBe('UNKNOWN');
    expect(ITEM_TYPES.FILE).toBe('FILE');
    expect(ITEM_TYPES.FOLDER).toBe('FOLDER');
  });
});

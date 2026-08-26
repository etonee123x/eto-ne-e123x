import { describe, expect, it } from 'vitest';

import { isNil } from '@/utils/isNil';

describe('isNil', () => {
  it('returns true for null and undefined', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
  });

  it('returns false for non-nil values', () => {
    expect(isNil('')).toBe(false);
    expect(isNil(0)).toBe(false);
    expect(isNil(false)).toBe(false);
    expect(isNil({})).toBe(false);
  });
});

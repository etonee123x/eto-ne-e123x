import { describe, expect, it } from 'vitest';

import { nonNullable } from '@/utils/nonNullable';

describe('nonNullable', () => {
  it('returns provided value when value is not nullish', () => {
    expect(nonNullable('ok')).toBe('ok');
    expect(nonNullable(0)).toBe(0);
    expect(nonNullable(false)).toBe(false);
  });

  it('throws when value is null', () => {
    expect(() => {
      return nonNullable(null, 'Value is required');
    }).toThrow('Value is required');
  });
});

import { describe, expect, it } from 'vitest';

import { throwError } from '@/utils/throw-error';

describe('throwError', () => {
  it('throws Error with provided message', () => {
    expect(() => {
      return throwError('boom');
    }).toThrow('boom');
  });

  it('throws Error without message when called without args', () => {
    expect(() => {
      return throwError();
    }).toThrow(Error);
  });
});

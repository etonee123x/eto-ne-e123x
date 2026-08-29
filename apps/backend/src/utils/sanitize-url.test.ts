import { describe, expect, it } from 'vitest';
import { sanitizeUrl } from './sanitize-url';

describe('sanitizeUrl', () => {
  it('redacts jwt and token query parameters', () => {
    const url = '/posts?jwt=secret-token&page=1';
    expect(sanitizeUrl(url)).toBe('/posts?jwt=%5BREDACTED%5D&page=1');
  });

  it('leaves safe query parameters unchanged', () => {
    const url = '/posts?pageSize=10&page=2';
    expect(sanitizeUrl(url)).toBe('/posts?pageSize=10&page=2');
  });

  it('handles relative path string gracefully', () => {
    expect(sanitizeUrl('/invalid-url')).toBe('/invalid-url');
  });
});

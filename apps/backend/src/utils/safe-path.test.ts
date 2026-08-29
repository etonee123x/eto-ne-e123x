import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveSafePath } from './safe-path';
import { AppError } from '@/shared/errors/app.error';

describe('resolveSafePath', () => {
  const baseDirectory = '/tmp/my-app/storage';

  it('resolves valid relative child path', () => {
    const result = resolveSafePath(baseDirectory, 'images/photo.png');
    expect(result).toBe(path.resolve(baseDirectory, 'images/photo.png'));
  });

  it('resolves root directory itself when given empty or dot', () => {
    const result = resolveSafePath(baseDirectory, '.');
    expect(result).toBe(path.resolve(baseDirectory));
  });

  it('resolves slash as base directory', () => {
    const result = resolveSafePath(baseDirectory, '/');
    expect(result).toBe(path.resolve(baseDirectory));
  });

  it('throws AppError 400 on parent traversal attempt', () => {
    expect(() => {
      return resolveSafePath(baseDirectory, '../etc/passwd');
    }).toThrow(AppError);
  });

  it('throws AppError 400 on slash-prefixed parent traversal attempt', () => {
    expect(() => {
      return resolveSafePath(baseDirectory, '/../etc/passwd');
    }).toThrow(AppError);
  });

  it('throws AppError 400 when slash-prefixed path climbs above base', () => {
    expect(() => {
      return resolveSafePath(baseDirectory, '/folder/../../etc/passwd');
    }).toThrow(AppError);
  });

  it('resolves leading slash paths inside base', () => {
    const result = resolveSafePath(baseDirectory, '/etc/passwd');
    expect(result).toBe(path.resolve(baseDirectory, 'etc/passwd'));
  });

  it('throws AppError 400 on backslash path', () => {
    expect(() => {
      return resolveSafePath(baseDirectory, String.raw`..\..\etc\passwd`);
    }).toThrow(AppError);
  });

  it('allows child names starting with dots', () => {
    const result = resolveSafePath(baseDirectory, '/..file');
    expect(result).toBe(path.resolve(baseDirectory, '..file'));
  });
});

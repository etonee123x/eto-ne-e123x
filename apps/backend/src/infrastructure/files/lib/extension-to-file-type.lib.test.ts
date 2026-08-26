import { describe, expect, it } from 'vitest';

import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { extensionToFileType } from './extension-to-file-type.lib';

describe('extension-to-file-type.lib', () => {
  it('returns UNKNOWN for null extension', () => {
    expect(extensionToFileType(null)).toBe(FILE_TYPES.UNKNOWN);
  });

  it('maps audio extensions case-insensitively', () => {
    expect(extensionToFileType('mp3')).toBe(FILE_TYPES.AUDIO);
    expect(extensionToFileType('OGG')).toBe(FILE_TYPES.AUDIO);
    expect(extensionToFileType('Wav')).toBe(FILE_TYPES.AUDIO);
  });

  it('maps image extensions case-insensitively', () => {
    expect(extensionToFileType('jpg')).toBe(FILE_TYPES.IMAGE);
    expect(extensionToFileType('JPEG')).toBe(FILE_TYPES.IMAGE);
    expect(extensionToFileType('PnG')).toBe(FILE_TYPES.IMAGE);
  });

  it('maps video extensions case-insensitively', () => {
    expect(extensionToFileType('mp4')).toBe(FILE_TYPES.VIDEO);
    expect(extensionToFileType('WEBM')).toBe(FILE_TYPES.VIDEO);
  });

  it('returns UNKNOWN for unsupported extension', () => {
    expect(extensionToFileType('zip')).toBe(FILE_TYPES.UNKNOWN);
  });
});

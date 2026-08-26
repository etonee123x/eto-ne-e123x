import { describe, expect, it } from 'vitest';

import { extensionToFileType, FILE_TYPES, ITEM_TYPES } from '@/helpers/folderData';

describe('folderData helper', () => {
  it('exposes file and item type dictionaries', () => {
    expect(FILE_TYPES.AUDIO).toBe('AUDIO');
    expect(FILE_TYPES.IMAGE).toBe('IMAGE');
    expect(FILE_TYPES.VIDEO).toBe('VIDEO');
    expect(FILE_TYPES.UNKNOWN).toBe('UNKNOWN');
    expect(ITEM_TYPES.FILE).toBe('FILE');
    expect(ITEM_TYPES.FOLDER).toBe('FOLDER');
  });

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

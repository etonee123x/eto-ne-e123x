import { describe, expect, it } from 'vitest';

import { FilesLocation } from '@/infrastructure/files/locations/FilesLocation';

describe('FilesLocation', () => {
  it('stores fs and src locations', () => {
    const filesLocation = new FilesLocation({ fs: '/tmp/data', src: '/content' });

    expect(filesLocation.fs).toBe('/tmp/data');
    expect(filesLocation.src).toBe('/content');
  });
});

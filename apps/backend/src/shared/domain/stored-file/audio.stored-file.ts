import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFile } from './stored-file';

export interface StoredFileAudio extends StoredFile {
  fileType: (typeof FILE_TYPES)['AUDIO'];
  metadata: {
    duration: number;
    bitrate: number | null;
    album: string | null;
    artists: Array<string>;
    bpm: number | null;
    year: number | null;
  };
}

import type { FILE_TYPES } from '@/helpers/folderData';
import type { StoredFileBase } from '../types/StoredFileBase';

export interface StoredFileAudio extends StoredFileBase {
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

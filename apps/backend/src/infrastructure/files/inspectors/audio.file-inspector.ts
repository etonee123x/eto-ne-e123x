import { parseBuffer } from 'music-metadata';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileAudio } from '@/shared/domain/stored-file';
import { FileInspector } from './file-inspector';
import type { FileSource } from '../types/file-source';
import type { FilesStorage } from '../storages/files-storage';

export class AudioFileInspector extends FileInspector {
  canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }) {
    return parameters.fileType === FILE_TYPES.AUDIO;
  }

  async inspect(parameters: {
    fileSource: FileSource;
    key: string;
    filesStorage: FilesStorage;
  }): Promise<StoredFileAudio> {
    const base = await super.inspect(parameters);
    const buffer = await parameters.fileSource.getBuffer();
    const audioMetadata = await parseBuffer(buffer);

    const specific = {
      fileType: FILE_TYPES.AUDIO,
      metadata: {
        duration: (audioMetadata.format.duration ?? 0) * 1000,
        bitrate: audioMetadata.format.bitrate ? audioMetadata.format.bitrate / 1000 : null,
        album: audioMetadata.common.album ?? null,
        artists: audioMetadata.common.artists ?? [],
        bpm: audioMetadata.common.bpm ?? null,
        year: audioMetadata.common.year ?? null,
      },
    };

    return {
      ...base,
      ...specific,
    };
  }
}

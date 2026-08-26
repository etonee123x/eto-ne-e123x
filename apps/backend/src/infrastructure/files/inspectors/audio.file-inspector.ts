import { parseBuffer } from 'music-metadata';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileAudio } from '@/shared/domain/stored-file/audio.stored-file';
import { FileInspectorBase } from './base.file-inspector';
import type { StoredFileSource } from '../types/stored-file-source';

export class AudioFileInspector extends FileInspectorBase {
  canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }) {
    return parameters.fileType === FILE_TYPES.AUDIO;
  }

  async inspect(parameters: { storedFileSource: StoredFileSource }): Promise<StoredFileAudio> {
    const base = await super.inspect(parameters);
    const buffer = await parameters.storedFileSource.getBuffer();
    const audioMetadata = await parseBuffer(buffer);

    const specific = {
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
      fileType: FILE_TYPES.AUDIO,
    };
  }
}

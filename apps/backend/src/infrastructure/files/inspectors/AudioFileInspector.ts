import { parseBuffer } from 'music-metadata';
import type { FileInspector } from './FileInspector';
import { FILE_TYPES } from '@/helpers/folderData';
import type { FileSource } from '../types/FileSource';
import type { StoredFileAudio } from '../entities/StoredFileAudio';
import type { StoredFileBase } from '../types/StoredFileBase';

export class AudioFileInspector implements FileInspector<Omit<StoredFileAudio, keyof StoredFileBase>> {
  async inspect(parameters: { fileSource: FileSource }) {
    const buffer = await parameters.fileSource.getBuffer();

    const audioMetadata = await parseBuffer(buffer);

    return {
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
  }
}

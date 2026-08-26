import { fileTypeFromBuffer } from 'file-type';
import type { AudioFileInspector } from './audio-file-inspector';
import type { ImageFileInspector } from './image-file-inspector';
import type { VideoFileInspector } from './video-file-inspector';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { extensionToFileType } from '../lib/extension-to-file-type.lib';
import type { UnknownFileInspector } from './unknown-file-inspector';
import type { FileSource } from '../types/file-source';

export class FileInspectorRouter {
  private readonly fileTypeToInspector: {
    [FILE_TYPES.AUDIO]: AudioFileInspector;
    [FILE_TYPES.IMAGE]: ImageFileInspector;
    [FILE_TYPES.VIDEO]: VideoFileInspector;
    [FILE_TYPES.UNKNOWN]: UnknownFileInspector;
  };

  constructor(parameters: {
    audioFileInspector: AudioFileInspector;
    imageFileInspector: ImageFileInspector;
    videoFileInspector: VideoFileInspector;
    unknownFileInspector: UnknownFileInspector;
  }) {
    this.fileTypeToInspector = {
      [FILE_TYPES.AUDIO]: parameters.audioFileInspector,
      [FILE_TYPES.IMAGE]: parameters.imageFileInspector,
      [FILE_TYPES.VIDEO]: parameters.videoFileInspector,
      [FILE_TYPES.UNKNOWN]: parameters.unknownFileInspector,
    };
  }

  async inspect(parameters: { fileSource: FileSource }) {
    const buffer = await parameters.fileSource.getBuffer();

    const fileTypeResult = await fileTypeFromBuffer(buffer);
    const fileType = fileTypeResult ? extensionToFileType(fileTypeResult.ext) : FILE_TYPES.UNKNOWN;

    return this.fileTypeToInspector[fileType].inspect(parameters);
  }
}

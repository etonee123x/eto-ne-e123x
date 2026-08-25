import { fileTypeFromBuffer } from 'file-type';
import type { AudioFileInspector } from './AudioFileInspector';
import type { ImageFileInspector } from './ImageFileInspector';
import type { VideoFileInspector } from './VideoFileInspector';
import { extensionToFileType, FILE_TYPES } from '@/helpers/folderData';
import type { UnknownFileInspector } from './UnknownFileInspector';
import type { FileSource } from '../types/FileSource';

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

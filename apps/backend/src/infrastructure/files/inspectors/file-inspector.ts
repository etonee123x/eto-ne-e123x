import { fileTypeFromBuffer } from 'file-type';
import type { AudioFileInspector } from './audio.file-inspector';
import type { ImageFileInspector } from './image.file-inspector';
import type { VideoFileInspector } from './video.file-inspector';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { extensionToFileType } from '../lib/extension-to-file-type.lib';
import type { UnknownFileInspector } from './unknown.file-inspector';
import type { FileSource } from '../types/file-source';
import type { FilesStorage } from '../storages/files-storage';
import type { StoredFile } from '@/shared/domain/stored-file';

interface FileInspectors {
  audioFileInspector: AudioFileInspector;
  imageFileInspector: ImageFileInspector;
  videoFileInspector: VideoFileInspector;
  unknownFileInspector: UnknownFileInspector;
}

export class FileInspector {
  private readonly filesStorage: FilesStorage;

  private readonly fileInspectors: Array<FileInspectors[keyof FileInspectors]>;

  constructor(parameters: { fileInspectors: FileInspectors; filesStorage: FilesStorage }) {
    this.fileInspectors = [
      parameters.fileInspectors.audioFileInspector,
      parameters.fileInspectors.imageFileInspector,
      parameters.fileInspectors.videoFileInspector,
      parameters.fileInspectors.unknownFileInspector,
    ];

    this.filesStorage = parameters.filesStorage;
  }

  async inspect(parameters: { key: string }): Promise<StoredFile> {
    const buffer = await this.filesStorage.getBuffer({ key: parameters.key });

    const fileSource: FileSource = {
      getBuffer: async () => {
        return buffer;
      },
      getPath: async () => {
        return parameters.key;
      },
    };

    const fileTypeResult = await fileTypeFromBuffer(buffer);
    const fileType = fileTypeResult ? extensionToFileType(fileTypeResult.ext) : FILE_TYPES.UNKNOWN;

    const fileInspector = this.fileInspectors.find((fileInspector) => {
      return fileInspector.canInspect({ fileType });
    });

    if (!fileInspector) {
      throw new Error(`No file inspector found for type: ${fileType}`);
    }

    return fileInspector.inspect({
      fileSource,
      key: parameters.key,
      filesStorage: this.filesStorage,
    });
  }
}

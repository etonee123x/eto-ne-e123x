import { fileTypeFromBuffer } from 'file-type';
import type { AudioFileInspector } from './audio.file-inspector';
import type { ImageFileInspector } from './image.file-inspector';
import type { VideoFileInspector } from './video.file-inspector';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { UnknownFileInspector } from './unknown.file-inspector';
import type { StoredFileSource } from '../types/stored-file-source';
import type { FilesStorage } from '../storages/files-storage';
import type { StoredFile } from '@/shared/domain/stored-file/stored-file';

const EXTENSIONS_AUDIO = new Set(['mp3', 'ogg', 'wav']);
const EXTENSIONS_IMAGE = new Set(['jpg', 'jpeg', 'png']);
const EXTENSIONS_VIDEO = new Set(['mp4', 'webm']);

interface FileInspectors {
  audioFileInspector: AudioFileInspector;
  imageFileInspector: ImageFileInspector;
  videoFileInspector: VideoFileInspector;
  unknownFileInspector: UnknownFileInspector;
}

export class FileInspector {
  private static extensionToFileType(extension: string | null) {
    if (extension === null) {
      return FILE_TYPES.UNKNOWN;
    }

    const extensionLowerCased = extension.toLowerCase();

    if (EXTENSIONS_AUDIO.has(extensionLowerCased)) {
      return FILE_TYPES.AUDIO;
    }

    if (EXTENSIONS_IMAGE.has(extensionLowerCased)) {
      return FILE_TYPES.IMAGE;
    }

    if (EXTENSIONS_VIDEO.has(extensionLowerCased)) {
      return FILE_TYPES.VIDEO;
    }

    return FILE_TYPES.UNKNOWN;
  }

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

    const storedFileSource: StoredFileSource = {
      getBuffer: async () => {
        return buffer;
      },
      getKey: async () => {
        return parameters.key;
      },
      getPath: async () => {
        return this.filesStorage.getPath({ key: parameters.key });
      },
    };

    const fileTypeResult = await fileTypeFromBuffer(buffer);
    const fileType = fileTypeResult ? FileInspector.extensionToFileType(fileTypeResult.ext) : FILE_TYPES.UNKNOWN;

    const fileInspector = this.fileInspectors.find((fileInspector) => {
      return fileInspector.canInspect({ fileType });
    });

    if (!fileInspector) {
      throw new Error(`No file inspector found for type: ${fileType}`);
    }

    return fileInspector.inspect({
      storedFileSource,
    });
  }
}

import sharp from 'sharp';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileImage } from '@/shared/domain/stored-file';
import { FileInspectorBase } from './base.file-inspector';
import type { FileSource } from '../types/file-source';
import type { FilesStorage } from '../storages/files-storage';

export class ImageFileInspector extends FileInspectorBase {
  canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }) {
    return parameters.fileType === FILE_TYPES.IMAGE;
  }

  async inspect(parameters: {
    fileSource: FileSource;
    key: string;
    filesStorage: FilesStorage;
  }): Promise<StoredFileImage> {
    const base = await super.inspect(parameters);
    const buffer = await parameters.fileSource.getBuffer();
    const metadata = await sharp(buffer).metadata();

    const specific = {
      metadata: {
        width: metadata.width,
        height: metadata.height,
      },
    };

    return {
      ...base,
      ...specific,
      fileType: FILE_TYPES.IMAGE,
    };
  }
}

import sharp from 'sharp';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileImage } from '@/shared/domain/stored-file/image.stored-file';
import { FileInspectorBase } from './base.file-inspector';
import type { StoredFileSource } from '../types/stored-file-source';

export class ImageFileInspector extends FileInspectorBase {
  canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }) {
    return parameters.fileType === FILE_TYPES.IMAGE;
  }

  async inspect(parameters: { storedFileSource: StoredFileSource }): Promise<StoredFileImage> {
    const base = await super.inspect(parameters);
    const buffer = await parameters.storedFileSource.getBuffer();
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

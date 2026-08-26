import type { FileInspector } from './file-inspector';
import sharp from 'sharp';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { FileSource } from '../types/file-source';
import type { StoredFileImage } from '../entities/stored-file-image';
import type { StoredFileBase } from '../types/stored-file-base';

export class ImageFileInspector implements FileInspector<Omit<StoredFileImage, keyof StoredFileBase>> {
  async inspect(parameters: { fileSource: FileSource }) {
    const buffer = await parameters.fileSource.getBuffer();

    const metadata = await sharp(buffer).metadata();

    return {
      fileType: FILE_TYPES.IMAGE,
      metadata: {
        width: metadata.width,
        height: metadata.height,
      },
    };
  }
}

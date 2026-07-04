import type { FileInspector } from './FileInspector';
import sharp from 'sharp';
import { FILE_TYPES } from '@/helpers/folderData';
import type { FileSource } from '../types/FileSource';
import type { StoredFileImage } from '../entities/StoredFileImage';
import type { StoredFileBase } from '../types/StoredFileBase';

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

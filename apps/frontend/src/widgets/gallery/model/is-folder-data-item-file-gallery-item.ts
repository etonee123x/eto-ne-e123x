import { FILE_TYPES } from '@/entities/file';
import type { components } from '@/shared/api/openapi';

export const isFolderDataItemFileGalleryItem = (file: components['schemas']['FolderDataItemFile']) => {
  return file.fileType === FILE_TYPES.IMAGE || file.fileType === FILE_TYPES.VIDEO;
};

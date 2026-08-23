import { FILE_TYPES } from '@/entities/file';
import type { components } from '@/shared/api/openapi';

export const folderDataItemGalleryItemToGalleryItem = (
  folderDataItemGalleryItem:
    components['schemas']['FolderDataItemImage'] | components['schemas']['FolderDataItemVideo'],
) => {
  return {
    src: folderDataItemGalleryItem.src,
    height: folderDataItemGalleryItem.metadata.height,
    width: folderDataItemGalleryItem.metadata.width,
    name: folderDataItemGalleryItem.name,
    type: folderDataItemGalleryItem.fileType === FILE_TYPES.IMAGE ? 'image' : 'video',
  } as const;
};

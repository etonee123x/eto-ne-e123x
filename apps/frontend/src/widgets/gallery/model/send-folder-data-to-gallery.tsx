'use client';

import { useGalleryContext } from '@/shared/lib/gallery';
import { useRouter } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { useEffect } from 'react';
import { isFolderDataItemFileGalleryItem } from './is-folder-data-item-file-gallery-item';
import { folderDataItemGalleryItemToGalleryItem } from './folder-data-item-file-to-gallery-item';
import { isNil } from '@/shared/utils/is-nil';

export const SendFolderDataToGallery = ({
  folderData,
  lastNavigationItem,
}: {
  folderData: components['schemas']['FolderDataResponse'];
  lastNavigationItem: { text: string; href: string };
}) => {
  const { setGalleryItem, open } = useGalleryContext();
  const router = useRouter();

  useEffect(() => {
    const file = folderData.file;
    const files = folderData.files;

    if (!(file && isFolderDataItemFileGalleryItem(file))) {
      setGalleryItem(null);
      return;
    }

    open(
      folderDataItemGalleryItemToGalleryItem(file),
      folderData.files.flatMap((file) => {
        return isFolderDataItemFileGalleryItem(file) ? [folderDataItemGalleryItemToGalleryItem(file)] : [];
      }),
      {
        onClose: () => {
          router.push(lastNavigationItem.href);
        },
        onGalleryItemChange: (galleryItem) => {
          const path = files.find((file) => {
            return file.src === galleryItem.src;
          })?.path;

          if (isNil(path)) {
            return;
          }

          router.replace('/explorer' + path);
        },
      },
    );
  }, [folderData, open, router, lastNavigationItem, setGalleryItem]);

  return null;
};

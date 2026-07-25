'use client';

import { useGalleryContext } from '@/app/[locale]/_components/the-gallery/gallery-context';
import { useRouter } from '@/i18n/navigation';
import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { components } from '@/lib/types/openapi';
import { useEffect } from 'react';

const isImageOrVideo = (file: components['schemas']['FolderDataItemFile']) => {
  return file.fileType === FILE_TYPES.IMAGE || file.fileType === FILE_TYPES.VIDEO;
};

export const SendFolderDataToGallery = ({
  folderData,
  lastNavigationItem,
}: {
  folderData: components['schemas']['FolderDataResponse'];
  lastNavigationItem: { text: string; href: string };
}) => {
  const { setGallery, open } = useGalleryContext();
  const router = useRouter();

  useEffect(() => {
    const file = folderData.file;
    if (!(file && isImageOrVideo(file))) {
      return;
    }

    open(file, {
      onClose: () => {
        router.push(lastNavigationItem.href);
      },
    });

    setGallery(
      folderData.files.filter((file) => {
        return isImageOrVideo(file);
      }),
    );
  }, [folderData, setGallery, open, router, lastNavigationItem]);

  return null;
};

'use client';

import { useGalleryContext } from '@/app/[locale]/_components/the-gallery/gallery-context';
import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { components } from '@/lib/types/openapi';
import { useEffect } from 'react';

export const SendFolderDataToGallery = ({
  folderData,
}: {
  folderData: components['schemas']['FolderDataResponse'];
}) => {
  const { setMedia, setGallery } = useGalleryContext();

  useEffect(() => {
    setMedia(
      folderData.file?.fileType === FILE_TYPES.IMAGE || folderData.file?.fileType === FILE_TYPES.VIDEO
        ? folderData.file
        : null,
    );
    setGallery(
      folderData.files.filter((file) => {
        return file.fileType === FILE_TYPES.IMAGE || file.fileType === FILE_TYPES.VIDEO;
      }),
    );
  }, [folderData, setGallery, setMedia]);

  return null;
};

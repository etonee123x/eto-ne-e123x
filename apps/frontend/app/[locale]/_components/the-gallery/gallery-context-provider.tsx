'use client';

import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { components } from '@/lib/types/openapi';
import { ContextType, PropsWithChildren, useState } from 'react';
import { GalleryContext } from './gallery-context';

export const GalleryContextProvider = ({
  children,
  initialFolderData,
}: PropsWithChildren<{
  initialFolderData: components['schemas']['FolderDataResponse'] | null;
}>) => {
  const [media, setMedia] = useState<NonNullable<ContextType<typeof GalleryContext>>['media']>(
    initialFolderData?.file?.fileType === FILE_TYPES.IMAGE || initialFolderData?.file?.fileType === FILE_TYPES.VIDEO
      ? initialFolderData.file
      : null,
  );
  const [gallery, setGallery] = useState<NonNullable<ContextType<typeof GalleryContext>>['gallery']>(() => {
    return (
      initialFolderData?.files.filter((file) => {
        return file.fileType === FILE_TYPES.IMAGE || file.fileType === FILE_TYPES.VIDEO;
      }) ?? []
    );
  });

  return (
    <GalleryContext
      value={{
        media,
        setMedia,

        gallery,
        setGallery,
      }}
    >
      {children}
    </GalleryContext>
  );
};

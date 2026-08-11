'use client';

import { FILE_TYPES } from '@/entities/file';
import { type components } from '@/shared/api/openapi';
import { type ContextType, type PropsWithChildren, useCallback, useRef, useState } from 'react';
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

  const onClose: NonNullable<ContextType<typeof GalleryContext>>['onClose'] = useRef(() => {});
  const onGalleryItemChange: NonNullable<ContextType<typeof GalleryContext>>['onGalleryItemChange'] = useRef(() => {});

  const open = useCallback<NonNullable<ContextType<typeof GalleryContext>>['open']>((media, parameters) => {
    setMedia(media);

    if (parameters?.onClose) {
      onClose.current = parameters.onClose;
    }

    if (parameters?.onGalleryItemChange) {
      onGalleryItemChange.current = parameters.onGalleryItemChange;
    }
  }, []);

  return (
    <GalleryContext
      value={{
        media,
        setMedia,

        gallery,
        setGallery,

        onClose,
        onGalleryItemChange,
        open,
      }}
    >
      {children}
    </GalleryContext>
  );
};

'use client';

import { type ContextType, type PropsWithChildren, useCallback, useRef, useState } from 'react';
import { GalleryContext } from './gallery-context';

export const GalleryContextProvider = ({
  children,
  initialGalleryItem = null,
  initialGalleryItems = [],
}: PropsWithChildren<{
  initialGalleryItem?: NonNullable<ContextType<typeof GalleryContext>>['galleryItem'];
  initialGalleryItems?: NonNullable<ContextType<typeof GalleryContext>>['galleryItems'];
}>) => {
  const [galleryItem, setGalleryItem] =
    useState<NonNullable<ContextType<typeof GalleryContext>>['galleryItem']>(initialGalleryItem);

  const [galleryItems, setGalleryItems] = useState<NonNullable<ContextType<typeof GalleryContext>>['galleryItems']>(
    () => {
      return initialGalleryItems;
    },
  );

  const onClose: NonNullable<ContextType<typeof GalleryContext>>['onClose'] = useRef(() => {});
  const onGalleryItemChange: NonNullable<ContextType<typeof GalleryContext>>['onGalleryItemChange'] = useRef(() => {});

  const open = useCallback<NonNullable<ContextType<typeof GalleryContext>>['open']>(
    (galleryItem, galleryItems, parameters) => {
      setGalleryItem(galleryItem);
      setGalleryItems(galleryItems);

      if (parameters?.onClose) {
        onClose.current = parameters.onClose;
      }

      if (parameters?.onGalleryItemChange) {
        onGalleryItemChange.current = parameters.onGalleryItemChange;
      }
    },
    [],
  );

  return (
    <GalleryContext
      value={{
        galleryItem,
        setGalleryItem,

        galleryItems,

        onClose,
        onGalleryItemChange,
        open,
      }}
    >
      {children}
    </GalleryContext>
  );
};

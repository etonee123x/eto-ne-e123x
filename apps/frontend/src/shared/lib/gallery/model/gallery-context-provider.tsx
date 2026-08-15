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
  const renderCloseControl: NonNullable<ContextType<typeof GalleryContext>>['renderCloseControl'] = useRef(null);
  const renderPreviousControl: NonNullable<ContextType<typeof GalleryContext>>['renderPreviousControl'] = useRef(null);
  const renderNextControl: NonNullable<ContextType<typeof GalleryContext>>['renderNextControl'] = useRef(null);

  const open = useCallback<NonNullable<ContextType<typeof GalleryContext>>['open']>(
    (galleryItem, galleryItems, parameters) => {
      setGalleryItem(galleryItem);
      setGalleryItems(galleryItems);

      if (parameters?.onClose) {
        onClose.current = parameters.onClose;
      }

      renderCloseControl.current = parameters?.renderCloseControl ?? null;
      renderPreviousControl.current = parameters?.renderPreviousControl ?? null;
      renderNextControl.current = parameters?.renderNextControl ?? null;
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
        renderCloseControl,
        renderPreviousControl,
        renderNextControl,
        open,
      }}
    >
      {children}
    </GalleryContext>
  );
};

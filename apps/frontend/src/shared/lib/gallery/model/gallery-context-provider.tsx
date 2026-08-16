'use client';

import { type ContextType, type PropsWithChildren, useCallback, useRef, useState } from 'react';
import { GalleryContext } from './gallery-context';
import { noop } from '@/shared/utils/noop';

const INITIAL_VALUES = {
  onClose: noop,
  renderCloseControl: null,
  renderPreviousControl: null,
  renderNextControl: null,
};

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

  const onClose: NonNullable<ContextType<typeof GalleryContext>>['onClose'] = useRef(INITIAL_VALUES.onClose);
  const renderCloseControl: NonNullable<ContextType<typeof GalleryContext>>['renderCloseControl'] = useRef(
    INITIAL_VALUES.renderCloseControl,
  );
  const renderPreviousControl: NonNullable<ContextType<typeof GalleryContext>>['renderPreviousControl'] = useRef(
    INITIAL_VALUES.renderPreviousControl,
  );
  const renderNextControl: NonNullable<ContextType<typeof GalleryContext>>['renderNextControl'] = useRef(
    INITIAL_VALUES.renderNextControl,
  );

  const open = useCallback<NonNullable<ContextType<typeof GalleryContext>>['open']>(
    (galleryItem, galleryItems, parameters) => {
      setGalleryItem(galleryItem);
      setGalleryItems(galleryItems);

      onClose.current = parameters?.onClose ?? INITIAL_VALUES.onClose;
      renderCloseControl.current = parameters?.renderCloseControl ?? INITIAL_VALUES.renderCloseControl;
      renderPreviousControl.current = parameters?.renderPreviousControl ?? INITIAL_VALUES.renderPreviousControl;
      renderNextControl.current = parameters?.renderNextControl ?? INITIAL_VALUES.renderNextControl;
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

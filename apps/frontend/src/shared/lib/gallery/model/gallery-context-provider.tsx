'use client';

import { type ContextType, type PropsWithChildren, useCallback, useRef, useState } from 'react';
import { GalleryContext } from './gallery-context';
import { noop } from '@/shared/utils/noop';

const INITIAL_VALUES = {
  onClose: noop,
  renderers: null,
};

export const GalleryContextProvider = ({
  children,
  initialGalleryItem = null,
  initialGalleryItems = [],
  initialRenderers = INITIAL_VALUES.renderers,
}: PropsWithChildren<{
  initialGalleryItem?: NonNullable<ContextType<typeof GalleryContext>>['galleryItem'];
  initialGalleryItems?: NonNullable<ContextType<typeof GalleryContext>>['galleryItems'];
  initialRenderers?: NonNullable<ContextType<typeof GalleryContext>>['renderers'];
}>) => {
  const [galleryItem, setGalleryItem] =
    useState<NonNullable<ContextType<typeof GalleryContext>>['galleryItem']>(initialGalleryItem);

  const [galleryItems, setGalleryItems] = useState<NonNullable<ContextType<typeof GalleryContext>>['galleryItems']>(
    () => {
      return initialGalleryItems;
    },
  );

  const onClose: NonNullable<ContextType<typeof GalleryContext>>['onClose'] = useRef(INITIAL_VALUES.onClose);
  const [renderers, setRenderers] = useState(initialRenderers);

  const open = useCallback<NonNullable<ContextType<typeof GalleryContext>>['open']>(
    (_galleryItem, galleryItems, parameters) => {
      setGalleryItem(_galleryItem);
      setGalleryItems(galleryItems);

      setRenderers(parameters?.renderers ?? INITIAL_VALUES.renderers);
    },
    [],
  );

  const setOnClose = useCallback<NonNullable<ContextType<typeof GalleryContext>>['setOnClose']>((_onClose) => {
    onClose.current = _onClose;
  }, []);

  return (
    <GalleryContext
      value={{
        galleryItem,
        setGalleryItem,

        galleryItems,

        onClose,
        setOnClose,

        renderers,
        open,
      }}
    >
      {children}
    </GalleryContext>
  );
};

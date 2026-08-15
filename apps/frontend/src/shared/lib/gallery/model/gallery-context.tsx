'use client';

import { throwError } from '@/shared/utils/throw-error';
import { createContext, type Dispatch, type RefObject, type SetStateAction, useContext } from 'react';
import type { GalleryItem } from '../types/gallery-item';

type CloseCallback = () => void;
type GalleryItemChangeCallback = (galleryItem: GalleryItem) => void;

export const GalleryContext = createContext<{
  galleryItem: GalleryItem | null;
  setGalleryItem: Dispatch<SetStateAction<GalleryItem | null>>;
  galleryItems: Array<GalleryItem>;

  open: (
    galleryItem: GalleryItem,
    galleryItems: Array<GalleryItem>,
    parameters?: Partial<{ onClose: CloseCallback; onGalleryItemChange: GalleryItemChangeCallback }>,
  ) => void;
  onClose: RefObject<CloseCallback>;
  onGalleryItemChange: RefObject<GalleryItemChangeCallback>;
} | null>(null);

export const useGalleryContext = () => {
  return useContext(GalleryContext) ?? throwError();
};

'use client';

import { throwError } from '@/shared/utils/throw-error';
import {
  createContext,
  type Dispatch,
  type ReactElement,
  type RefObject,
  type SetStateAction,
  useContext,
} from 'react';
import type { GalleryItem } from '../types/gallery-item';

type CloseCallback = () => void;
type RenderCloseControl = () => ReactElement;
type RenderCarouselControl = (galleryItem: GalleryItem) => ReactElement;

export const GalleryContext = createContext<{
  galleryItem: GalleryItem | null;
  setGalleryItem: Dispatch<SetStateAction<GalleryItem | null>>;
  galleryItems: Array<GalleryItem>;

  open: (
    galleryItem: GalleryItem,
    galleryItems: Array<GalleryItem>,
    parameters?: Partial<{
      onClose: CloseCallback;
      renderCloseControl: RenderCloseControl;
      renderPreviousControl: RenderCarouselControl;
      renderNextControl: RenderCarouselControl;
    }>,
  ) => void;
  onClose: RefObject<CloseCallback>;
  renderCloseControl: RefObject<RenderCloseControl | null>;
  renderPreviousControl: RefObject<RenderCarouselControl | null>;
  renderNextControl: RefObject<RenderCarouselControl | null>;
} | null>(null);

export const useGalleryContext = () => {
  return useContext(GalleryContext) ?? throwError();
};

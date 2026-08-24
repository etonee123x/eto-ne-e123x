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

type GalleryRenderers = Partial<{
  previousControl: ReactElement;
  nextControl: ReactElement;
}> | null;

type OnClose = (() => void) | null;

export const GalleryContext = createContext<{
  galleryItem: GalleryItem | null;
  setGalleryItem: Dispatch<SetStateAction<GalleryItem | null>>;

  galleryItems: Array<GalleryItem>;

  open: (
    galleryItem: GalleryItem,
    galleryItems: Array<GalleryItem>,
    parameters?: Partial<{
      shouldShowName: boolean;
      renderers: GalleryRenderers;
    }>,
  ) => void;

  onClose: RefObject<OnClose>;
  setOnClose: (onClose: OnClose) => void;

  shouldShowName: boolean;
  renderers: GalleryRenderers;
} | null>(null);

export const useGalleryContext = () => {
  return useContext(GalleryContext) ?? throwError();
};

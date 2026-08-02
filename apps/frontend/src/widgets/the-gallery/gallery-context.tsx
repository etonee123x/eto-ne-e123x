'use client';

import { type components } from '@/lib/types/openapi';
import { throwError } from '@/shared/utils/throw-error';
import { createContext, type Dispatch, type RefObject, type SetStateAction, useContext } from 'react';

type Media = components['schemas']['FolderDataItemVideo'] | components['schemas']['FolderDataItemImage'];

type CloseCallback = () => void;
type GalleryItemChangeCallback = (media: Media) => void;

export const GalleryContext = createContext<{
  media: Media | null;
  setMedia: Dispatch<SetStateAction<Media | null>>;
  gallery: Array<Media>;
  setGallery: Dispatch<SetStateAction<Array<Media>>>;

  open: (
    media: Media,
    parameters?: Partial<{ onClose: CloseCallback; onGalleryItemChange: GalleryItemChangeCallback }>,
  ) => void;
  onClose: RefObject<CloseCallback>;
  onGalleryItemChange: RefObject<GalleryItemChangeCallback>;
} | null>(null);

export const useGalleryContext = () => {
  return useContext(GalleryContext) ?? throwError();
};

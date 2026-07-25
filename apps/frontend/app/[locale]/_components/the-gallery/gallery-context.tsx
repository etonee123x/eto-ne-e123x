'use client';

import { components } from '@/lib/types/openapi';
import { throwError } from '@/lib/utils/throw-error';
import { createContext, Dispatch, RefObject, SetStateAction, useContext } from 'react';

type Media = components['schemas']['FolderDataItemVideo'] | components['schemas']['FolderDataItemImage'];

type Callback = () => void;

export const GalleryContext = createContext<{
  media: Media | null;
  setMedia: Dispatch<SetStateAction<Media | null>>;
  gallery: Array<Media>;
  setGallery: Dispatch<SetStateAction<Array<Media>>>;

  open: (media: Media, parameters?: Partial<{ onClose: Callback }>) => void;
  onClose: RefObject<Callback>;
} | null>(null);

export const useGalleryContext = () => {
  return useContext(GalleryContext) ?? throwError();
};

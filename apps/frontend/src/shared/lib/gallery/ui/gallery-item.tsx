import Image from 'next/image';
import type { GalleryItem as TGalleryItem } from '../types/gallery-item';
import { Video } from './video';

export const GalleryItem = ({ galleryItem }: { galleryItem: TGalleryItem }) => {
  const propsBase = {
    className: 'h-full w-full object-contain',
    width: galleryItem.width,
    height: galleryItem.height,
    src: galleryItem.src,
  };

  if (galleryItem.type === 'image') {
    return <Image {...propsBase} alt={galleryItem.name} />;
  }

  return <Video {...propsBase} />;
};

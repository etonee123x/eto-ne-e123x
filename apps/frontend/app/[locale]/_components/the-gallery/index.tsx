'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useGalleryContext } from './gallery-context';
import { ComponentProps } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { components } from '@/lib/types/openapi';
import { FILE_TYPES } from '@/lib/helpers/folder-data';
import Image from 'next/image';

const Media = ({
  media,
}: {
  media: components['schemas']['FolderDataItemImage'] | components['schemas']['FolderDataItemVideo'];
}) => {
  const props = {
    className: 'h-full w-full object-contain',
    width: media.metadata.width,
    height: media.metadata.height,
    src: media.src,
  };

  if (media.fileType === FILE_TYPES.IMAGE) {
    return <Image {...props} alt={media.name} />;
  }

  return <video {...props} controls autoPlay />;
};

export const TheGallery = () => {
  const { media, setMedia, onClose, gallery } = useGalleryContext();

  const onOpenChange: ComponentProps<typeof Dialog>['onOpenChange'] = (isOpen) => {
    if (isOpen) {
      return;
    }

    setMedia(null);
    onClose.current();
  };

  return (
    <Dialog open={Boolean(media)} onOpenChange={onOpenChange}>
      {media && (
        <DialogContent className="h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)]">
          <DialogTitle className="text-center">{media.name}</DialogTitle>
          <Carousel className="h-full min-h-0 w-full *:data-[slot=carousel-content]:h-full">
            <CarouselContent className="h-full">
              {gallery.map((galleryItem) => {
                return (
                  <CarouselItem key={galleryItem.src} className="flex h-full items-center justify-center">
                    <Media media={galleryItem} />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious size={'lg'} className="inset-s-0!" />
            <CarouselNext size={'lg'} className="inset-e-0!" />
          </Carousel>
        </DialogContent>
      )}
    </Dialog>
  );
};

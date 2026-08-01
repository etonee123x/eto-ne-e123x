'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGalleryContext } from './gallery-context';
import { type ComponentProps, useCallback, useEffect, useState } from 'react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type components } from '@/lib/types/openapi';
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

const CARD_HEADER_HEIGHT = '2.75rem';

export const TheGallery = () => {
  const { media, setMedia, onClose, onGalleryItemChange, gallery } = useGalleryContext();

  const [api, setApi] = useState<NonNullable<CarouselApi> | null>(null);

  const onOpenChange: ComponentProps<typeof Dialog>['onOpenChange'] = (isOpen) => {
    if (isOpen) {
      return;
    }

    setMedia(null);
    onClose.current();
  };

  const onSlideChange = useCallback(
    (carouselApi: NonNullable<CarouselApi>) => {
      const galleryItem = gallery[carouselApi.selectedScrollSnap()];

      onGalleryItemChange.current(galleryItem);
    },
    [gallery, onGalleryItemChange],
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', onSlideChange);

    return () => {
      api.off('select', onSlideChange);
    };
  }, [api, onSlideChange]);

  return (
    <Dialog open={Boolean(media)} onOpenChange={onOpenChange}>
      {media && (
        <DialogContent className="border-primary border h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)]">
          <Carousel
            className="h-full min-h-0 w-full *:data-[slot=carousel-content]:h-full"
            setApi={(api) => {
              setApi(api ?? null);
            }}
          >
            <CarouselContent className="h-full p-px">
              {gallery.map((galleryItem) => {
                const aspectRatio = galleryItem.metadata.width / galleryItem.metadata.height;

                return (
                  <CarouselItem
                    key={galleryItem.src}
                    className="@container-size flex h-full items-center justify-center"
                  >
                    <Card
                      style={{
                        width: `min(100cqw, calc((100cqh - ${CARD_HEADER_HEIGHT}) * ${aspectRatio}))`,
                        height: `min(100cqh, calc(100cqw / ${aspectRatio} + ${CARD_HEADER_HEIGHT}))`,
                      }}
                    >
                      <CardHeader className="text-center">
                        <CardTitle>{galleryItem.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Media media={galleryItem} />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious size="lg" className="inset-s-0!" />
            <CarouselNext size="lg" className="inset-e-0!" />
          </Carousel>
        </DialogContent>
      )}
    </Dialog>
  );
};

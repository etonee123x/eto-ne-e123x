'use client';

import { Dialog, DialogContent } from '@/shared/ui/ds/dialog';
import { useGalleryContext } from '@/shared/lib/gallery';
import { type ComponentProps, useCallback, useEffect, useState } from 'react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/shared/ui/ds/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ds/card';
import { GalleryItem } from './gallery-item';

const CARD_HEADER_HEIGHT = '2.75rem';

const GalleryControls = () => {
  const { canScrollNext, canScrollPrev } = useCarousel();

  return (
    <>
      {canScrollPrev && <CarouselPrevious size="lg" className="inset-s-0!" />}
      {canScrollNext && <CarouselNext size="lg" className="inset-e-0!" />}
    </>
  );
};

export const Gallery = () => {
  const { galleryItem, setGalleryItem, onClose, onGalleryItemChange, galleryItems } = useGalleryContext();

  const [api, setApi] = useState<NonNullable<CarouselApi> | null>(null);

  const onOpenChange: ComponentProps<typeof Dialog>['onOpenChange'] = (isOpen) => {
    if (isOpen) {
      return;
    }

    setGalleryItem(null);
    onClose.current();
  };

  const onSlideChange = useCallback(
    (carouselApi: NonNullable<CarouselApi>) => {
      onGalleryItemChange.current(galleryItems[carouselApi.selectedScrollSnap()]);
    },
    [galleryItems, onGalleryItemChange],
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
    <Dialog open={Boolean(galleryItem)} onOpenChange={onOpenChange}>
      {galleryItem && (
        <DialogContent className="border-primary border h-[calc(100dvh-2rem)] sm:max-w-none w-[calc(100dvw-2rem)]">
          <Carousel
            className="h-full min-h-0 w-full *:data-[slot=carousel-content]:h-full"
            opts={{
              startIndex: galleryItems.findIndex((_galleryItem) => {
                return _galleryItem.src === galleryItem.src;
              }),
            }}
            setApi={(api) => {
              setApi(api ?? null);
            }}
          >
            <CarouselContent className="h-full p-px">
              {galleryItems.map((galleryItem) => {
                const aspectRatio = galleryItem.width / galleryItem.height;

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
                        <GalleryItem galleryItem={galleryItem} />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <GalleryControls />
          </Carousel>
        </DialogContent>
      )}
    </Dialog>
  );
};

'use client';

import { Dialog, DialogContent } from '@/shared/ui/ds/dialog';
import { useGalleryContext } from '@/shared/lib/gallery';
import { type ComponentProps } from 'react';
import { Button } from '@/shared/ui/ds/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ds/card';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { GalleryItem } from './gallery-item';

const CARD_VERTICAL_OVERHEAD = '6.5rem';

const GalleryControls = ({ currentIndex }: { currentIndex: number }) => {
  const { galleryItems, renderPreviousControl, renderNextControl, setGalleryItem } = useGalleryContext();

  const previousGalleryItem = galleryItems[currentIndex - 1];
  const nextGalleryItem = galleryItems[currentIndex + 1];

  const previousControlRender = previousGalleryItem ? renderPreviousControl.current?.(previousGalleryItem) : undefined;
  const nextControlRender = nextGalleryItem ? renderNextControl.current?.(nextGalleryItem) : undefined;

  return (
    <>
      {previousGalleryItem && (
        <Button
          size="lg"
          variant="outline"
          className="absolute inset-y-0 inset-s-0! my-auto rounded-full"
          render={previousControlRender}
          nativeButton={!previousControlRender}
          onClick={() => {
            if (previousControlRender) {
              return;
            }

            setGalleryItem(previousGalleryItem);
          }}
        >
          <ChevronLeftIcon />
          <span className="sr-only">Previous slide</span>
        </Button>
      )}
      {nextGalleryItem && (
        <Button
          size="lg"
          variant="outline"
          className="absolute inset-y-0 inset-e-0! my-auto rounded-full"
          render={nextControlRender}
          nativeButton={!nextControlRender}
          onClick={() => {
            if (nextControlRender) {
              return;
            }

            setGalleryItem(nextGalleryItem);
          }}
        >
          <ChevronRightIcon />
          <span className="sr-only">Next slide</span>
        </Button>
      )}
    </>
  );
};

export const Gallery = () => {
  const { galleryItem, setGalleryItem, onClose, renderCloseControl, galleryItems } = useGalleryContext();

  const onOpenChange: ComponentProps<typeof Dialog>['onOpenChange'] = (isOpen) => {
    if (isOpen) {
      return;
    }

    setGalleryItem(null);
    onClose.current();
  };

  const currentIndex = galleryItem
    ? galleryItems.findIndex((_galleryItem) => {
        return _galleryItem.src === galleryItem.src;
      })
    : 0;

  return (
    <Dialog open={Boolean(galleryItem)} onOpenChange={onOpenChange}>
      {galleryItem && (
        <DialogContent
          className="border-primary border h-[calc(100dvh-2rem)] sm:max-w-none w-[calc(100dvw-2rem)]"
          closeButtonRender={renderCloseControl.current?.()}
        >
          <div className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center">
            <Card
              className="max-h-full max-w-full overflow-hidden"
              style={{
                width: `min(100cqw, calc((100cqh - ${CARD_VERTICAL_OVERHEAD}) * ${galleryItem.width / galleryItem.height}))`,
                height: `min(100cqh, calc(100cqw / ${galleryItem.width / galleryItem.height} + ${CARD_VERTICAL_OVERHEAD}))`,
              }}
            >
              <CardHeader className="text-center">
                <CardTitle>{galleryItem.name}</CardTitle>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-hidden">
                <GalleryItem galleryItem={galleryItem} />
              </CardContent>
            </Card>
            <GalleryControls currentIndex={currentIndex} />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

'use client';

import { Dialog, DialogContent } from '@/shared/ui/ds/dialog';
import { useGalleryContext } from '@/shared/lib/gallery';
import { useRef, type ComponentProps, type CSSProperties } from 'react';
import { Button } from '@/shared/ui/ds/button';
import { Card, CardContent } from '@/shared/ui/ds/card';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useElementSize } from '@reactuses/core';
import { GalleryItem } from './gallery-item';

const GalleryControls = ({ currentIndex }: { currentIndex: number }) => {
  const { galleryItems, renderers, setGalleryItem } = useGalleryContext();

  const previousGalleryItem = galleryItems[currentIndex - 1];
  const nextGalleryItem = galleryItems[currentIndex + 1];

  const previousControlRender = renderers?.previousControl;
  const nextControlRender = renderers?.nextControl;

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
  const { galleryItem, setGalleryItem, onClose, renderers, galleryItems } = useGalleryContext();

  const headerRef = useRef<HTMLDivElement>(null);
  const [, headerHeight] = useElementSize(headerRef, { box: 'border-box' });

  const onOpenChange: ComponentProps<typeof Dialog>['onOpenChange'] = (isOpen) => {
    if (isOpen) {
      return;
    }

    setGalleryItem(null);
    onClose.current?.();
  };

  const currentIndex = galleryItem
    ? galleryItems.findIndex((_galleryItem) => {
        return _galleryItem.src === galleryItem.src;
      })
    : 0;
  const mediaRatio = galleryItem ? galleryItem.width / galleryItem.height : 1;

  // real header height (measured) + its flex gap, instead of a guessed constant
  const headerSpace = renderers?.header ? `calc(${headerHeight}px + var(--card-spacing))` : '0px';

  const cardStyle = {
    '--gallery-media-max-inline-size': 'calc(100cqw - var(--card-spacing) * 2)',
    '--gallery-media-max-block-size': `max(0px, calc(100cqh - var(--card-spacing) * 2 - ${headerSpace}))`,
  } as CSSProperties;

  const mediaStyle = {
    aspectRatio: `${galleryItem?.width ?? 1} / ${galleryItem?.height ?? 1}`,
    width: `min(var(--gallery-media-max-inline-size), calc(var(--gallery-media-max-block-size) * ${mediaRatio}))`,
  } satisfies CSSProperties;

  return (
    <Dialog open={Boolean(galleryItem)} onOpenChange={onOpenChange}>
      {galleryItem && (
        <DialogContent className="border-primary border h-[calc(100dvh-2rem)] sm:max-w-none w-[calc(100dvw-2rem)]">
          <div className="@container-size relative flex h-full min-h-0 w-full min-w-0 items-center justify-center">
            <Card className="max-h-full max-w-full overflow-hidden" style={cardStyle}>
              {renderers?.header && <div ref={headerRef}>{renderers.header}</div>}
              <CardContent className="overflow-hidden">
                <div
                  className="max-h-(--gallery-media-max-block-size) max-w-(--gallery-media-max-inline-size)"
                  style={mediaStyle}
                >
                  <GalleryItem galleryItem={galleryItem} />
                </div>
              </CardContent>
            </Card>
            <GalleryControls currentIndex={currentIndex} />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

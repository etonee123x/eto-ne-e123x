'use client';

import { useGalleryContext } from '@/shared/lib/gallery';
import { BaseAlwaysScrollable } from '@/shared/ui/base-always-scrollable';
import { CardTitle } from '@/shared/ui/ds/card';
import { Link } from '@/i18n/navigation';
import type { ComponentProps } from 'react';
import type { components } from '@/shared/api/openapi';

export const ExplorerGalleryHeader = () => {
  const { galleryItem } = useGalleryContext();

  return (
    galleryItem && (
      <CardTitle>
        <BaseAlwaysScrollable>{galleryItem.name}</BaseAlwaysScrollable>
      </CardTitle>
    )
  );
};

const ExplorerGalleryCarouselControl = ({
  children,
  direction,
  files,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href' | 'scroll'> & {
  direction: 'previous' | 'next';
  files: components['schemas']['FolderDataResponse']['files'];
}) => {
  const { galleryItem, galleryItems } = useGalleryContext();

  if (!galleryItem) {
    return null;
  }

  const currentIndex = galleryItems.findIndex((item) => {
    return item.src === galleryItem.src;
  });
  const targetItem = galleryItems[currentIndex + (direction === 'previous' ? -1 : 1)];

  const targetFile = files.find((file) => {
    return file.src === targetItem?.src;
  });

  if (!targetFile) {
    return null;
  }

  return (
    <Link href={'/explorer' + targetFile.path} scroll={false} {...props}>
      {children}
    </Link>
  );
};

export const ExplorerGalleryPreviousControl = ({
  ...props
}: Omit<ComponentProps<typeof ExplorerGalleryCarouselControl>, 'direction'>) => {
  return <ExplorerGalleryCarouselControl direction="previous" {...props} />;
};

export const ExplorerGalleryNextControl = ({
  ...props
}: Omit<ComponentProps<typeof ExplorerGalleryCarouselControl>, 'direction'>) => {
  return <ExplorerGalleryCarouselControl direction="next" {...props} />;
};

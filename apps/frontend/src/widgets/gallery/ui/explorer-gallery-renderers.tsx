'use client';

import { useGalleryContext } from '@/shared/lib/gallery';
import { BaseAlwaysScrollable } from '@/shared/ui/base-always-scrollable';
import { CardTitle } from '@/shared/ui/ds/card';
import { Link } from '@/i18n/navigation';
import type { components } from '@/shared/api/openapi';

type ExplorerGalleryFile = Pick<components['schemas']['FolderDataItemFile'], 'src' | 'path'>;

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

export const ExplorerGalleryCloseControl = ({ href }: { href: string }) => {
  return <Link href={href} scroll={false} />;
};

const ExplorerGalleryCarouselControl = ({
  direction,
  files,
}: {
  direction: 'previous' | 'next';
  files: Array<ExplorerGalleryFile>;
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

  return <Link href={'/explorer' + targetFile.path} scroll={false} />;
};

export const ExplorerGalleryPreviousControl = ({ files }: { files: Array<ExplorerGalleryFile> }) => {
  return <ExplorerGalleryCarouselControl direction="previous" files={files} />;
};

export const ExplorerGalleryNextControl = ({ files }: { files: Array<ExplorerGalleryFile> }) => {
  return <ExplorerGalleryCarouselControl direction="next" files={files} />;
};

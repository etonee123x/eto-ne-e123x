'use client';

import { useGalleryContext, type GalleryItem } from '@/shared/lib/gallery';
import { Link, useRouter } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { useEffect, useRef } from 'react';
import { isFolderDataItemFileGalleryItem } from './is-folder-data-item-file-gallery-item';
import { folderDataItemGalleryItemToGalleryItem } from './folder-data-item-file-to-gallery-item';
import { isNil } from '@/shared/utils/is-nil';

export const SendFolderDataToGallery = ({
  folderData,
  lastNavigationItem,
}: {
  folderData: components['schemas']['FolderDataResponse'];
  lastNavigationItem: { text: string; href: string };
}) => {
  const { setGalleryItem, open } = useGalleryContext();
  const router = useRouter();

  const isClosingByLink = useRef(false);

  useEffect(() => {
    const file = folderData.file;
    const files = folderData.files;

    if (!(file && isFolderDataItemFileGalleryItem(file))) {
      setGalleryItem(null);
      return;
    }

    const getGalleryItemHref = (galleryItem: GalleryItem) => {
      const path = files.find((file) => {
        return file.src === galleryItem.src;
      })?.path;

      return isNil(path) ? lastNavigationItem.href : '/explorer' + path;
    };

    open(
      folderDataItemGalleryItemToGalleryItem(file),
      folderData.files.flatMap((file) => {
        return isFolderDataItemFileGalleryItem(file) ? [folderDataItemGalleryItemToGalleryItem(file)] : [];
      }),
      {
        onClose: () => {
          if (isClosingByLink.current) {
            isClosingByLink.current = false;
            return;
          }

          router.push(lastNavigationItem.href, { scroll: false });
        },
        renderCloseControl: () => {
          return (
            <Link
              href={lastNavigationItem.href}
              scroll={false}
              onClick={() => {
                isClosingByLink.current = true;
              }}
            />
          );
        },
        renderPreviousControl: (galleryItem) => {
          return <Link href={getGalleryItemHref(galleryItem)} scroll={false} />;
        },
        renderNextControl: (galleryItem) => {
          return <Link href={getGalleryItemHref(galleryItem)} scroll={false} />;
        },
      },
    );
  }, [folderData, open, router, lastNavigationItem, setGalleryItem]);

  return null;
};

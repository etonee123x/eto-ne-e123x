'use client';

import { useGalleryContext } from '@/shared/lib/gallery';
import { useRouter } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { useEffect } from 'react';
import { isFolderDataItemFileGalleryItem } from './is-folder-data-item-file-gallery-item';
import { folderDataItemGalleryItemToGalleryItem } from './folder-data-item-file-to-gallery-item';
import {
  ExplorerGalleryCloseControl,
  ExplorerGalleryHeader,
  ExplorerGalleryNextControl,
  ExplorerGalleryPreviousControl,
} from '../ui/explorer-gallery-renderers';

export const SendFolderDataToGallery = ({
  folderData,
  lastNavigationItem,
}: {
  folderData: components['schemas']['FolderDataResponse'];
  lastNavigationItem: { text: string; href: string };
}) => {
  const { setGalleryItem, open, galleryItem, onClose, setOnClose } = useGalleryContext();
  const router = useRouter();

  useEffect(() => {
    const file = folderData.file;

    if (!(file && isFolderDataItemFileGalleryItem(file))) {
      setGalleryItem(null);
      return;
    }

    const fileAsGalleryItem = folderDataItemGalleryItemToGalleryItem(file);

    const onCloseExplorerGallery = () => {
      router.push(lastNavigationItem.href, { scroll: false });
    };

    if (galleryItem?.src === fileAsGalleryItem.src) {
      if (!onClose.current) {
        setOnClose(onCloseExplorerGallery);
      }

      return;
    }

    open(
      fileAsGalleryItem,
      folderData.files.flatMap((file) => {
        return isFolderDataItemFileGalleryItem(file) ? [folderDataItemGalleryItemToGalleryItem(file)] : [];
      }),
      {
        renderers: {
          closeControl: <ExplorerGalleryCloseControl href={lastNavigationItem.href} />,
          header: <ExplorerGalleryHeader />,
          previousControl: <ExplorerGalleryPreviousControl files={folderData.files} />,
          nextControl: <ExplorerGalleryNextControl files={folderData.files} />,
        },
      },
    );
    setOnClose(onCloseExplorerGallery);
  }, [folderData, galleryItem, open, router, lastNavigationItem, setGalleryItem, setOnClose, onClose]);

  return null;
};

'use client';

import { useGalleryContext } from '@/shared/lib/gallery';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { useEffect, useEffectEvent } from 'react';
import { isFolderDataItemFileGalleryItem } from './is-folder-data-item-file-gallery-item';
import { folderDataItemGalleryItemToGalleryItem } from './folder-data-item-file-to-gallery-item';
import {
  ExplorerGalleryHeader,
  ExplorerGalleryNextControl,
  ExplorerGalleryPreviousControl,
} from '../ui/explorer-gallery-renderers';

export const SendFolderDataToGallery = ({
  folderData,
  navigationItemUp,
}: {
  folderData: components['schemas']['FolderDataResponse'];
  navigationItemUp: { text: string; href: string } | null;
}) => {
  const { setGalleryItem, open, galleryItem, setOnClose } = useGalleryContext();
  const router = useRouter();
  const pathname = usePathname();

  const onCloseExplorerGallery = () => {
    if (!navigationItemUp) {
      return;
    }

    router.push(navigationItemUp.href, { scroll: false });
  };

  const syncGalleryWithFolderData = useEffectEvent(() => {
    const file = folderData.file;

    if (!(file && isFolderDataItemFileGalleryItem(file))) {
      setGalleryItem(null);
      return;
    }

    const fileAsGalleryItem = folderDataItemGalleryItemToGalleryItem(file);

    setOnClose(onCloseExplorerGallery);

    if (galleryItem?.src === fileAsGalleryItem.src) {
      return;
    }

    open(
      fileAsGalleryItem,
      folderData.files.flatMap((file) => {
        return isFolderDataItemFileGalleryItem(file) ? [folderDataItemGalleryItemToGalleryItem(file)] : [];
      }),
      {
        renderers: {
          header: <ExplorerGalleryHeader />,
          previousControl: <ExplorerGalleryPreviousControl files={folderData.files} />,
          nextControl: <ExplorerGalleryNextControl files={folderData.files} />,
        },
      },
    );
  });

  useEffect(() => {
    syncGalleryWithFolderData();
  }, [pathname]);

  return null;
};

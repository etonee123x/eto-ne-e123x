import { type ComponentProps } from 'react';
import { GalleryContextProvider } from '@/shared/lib/gallery';
import { headers as _headers } from 'next/headers';
import { isNil } from '@/shared/utils/is-nil';
import { getFolderDataQueryOptions } from '@/entities/folder-data';
import { QueryClient } from '@tanstack/react-query';
import { isFolderDataItemFileGalleryItem } from './is-folder-data-item-file-gallery-item';
import { folderDataItemGalleryItemToGalleryItem } from './folder-data-item-file-to-gallery-item';
import { ExplorerGalleryNextControl, ExplorerGalleryPreviousControl } from '../ui/explorer-gallery-renderers';

export const GalleryProvider = async ({
  children,
}: Omit<
  ComponentProps<typeof GalleryContextProvider>,
  'initialGalleryItem' | 'initialGalleryItems' | 'initialShouldShowName' | 'initialRenderers'
>) => {
  const headers = await _headers();
  // middleware may skip some paths (e.g. containing a dot), so x-pathname can be absent
  const xPathname = headers.get('x-pathname') ?? '/';

  const explorerPath = xPathname.startsWith('/explorer') ? xPathname.replace(/^\/explorer/, '') || '/' : null;

  const folderData = isNil(explorerPath)
    ? null
    : await new QueryClient().fetchQuery(getFolderDataQueryOptions(explorerPath || '/')).catch(() => {
        return null;
      });

  const galleryItem =
    folderData?.file && isFolderDataItemFileGalleryItem(folderData.file)
      ? folderDataItemGalleryItemToGalleryItem(folderData.file)
      : null;

  const galleryItems =
    folderData?.files.flatMap((folderDataFile) => {
      return isFolderDataItemFileGalleryItem(folderDataFile)
        ? [folderDataItemGalleryItemToGalleryItem(folderDataFile)]
        : [];
    }) ?? [];

  return (
    <GalleryContextProvider
      initialGalleryItem={galleryItem}
      initialGalleryItems={galleryItems}
      initialShouldShowName={Boolean(galleryItem)}
      initialRenderers={
        galleryItem && {
          previousControl: <ExplorerGalleryPreviousControl files={folderData?.files ?? []} />,
          nextControl: <ExplorerGalleryNextControl files={folderData?.files ?? []} />,
        }
      }
    >
      {children}
    </GalleryContextProvider>
  );
};

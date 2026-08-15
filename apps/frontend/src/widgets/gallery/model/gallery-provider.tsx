import { type ComponentProps } from 'react';
import { GalleryContextProvider } from '@/shared/lib/gallery';
import { headers as _headers } from 'next/headers';
import { isNil } from '@/shared/utils/is-nil';
import { throwError } from '@/shared/utils/throw-error';
import { getFolderDataQueryOptions } from '@/entities/folder-data';
import { QueryClient } from '@tanstack/react-query';
import { isFolderDataItemFileGalleryItem } from './is-folder-data-item-file-gallery-item';
import { folderDataItemGalleryItemToGalleryItem } from './folder-data-item-file-to-gallery-item';

export const GalleryProvider = async ({
  children,
}: Omit<ComponentProps<typeof GalleryContextProvider>, 'initialFolderData'>) => {
  const headers = await _headers();
  const xPathname = headers.get('x-pathname') ?? throwError();

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

  const galleryItems = folderData?.files.flatMap((folderDataFile) => {
    return isFolderDataItemFileGalleryItem(folderDataFile)
      ? [folderDataItemGalleryItemToGalleryItem(folderDataFile)]
      : [];
  });

  return (
    <GalleryContextProvider initialGalleryItem={galleryItem} initialGalleryItems={galleryItems}>
      {children}
    </GalleryContextProvider>
  );
};

import { type ComponentProps } from 'react';
import { GalleryContextProvider } from './gallery-context-provider';
import { headers as _headers } from 'next/headers';
import { isNil } from '@/shared/utils/is-nil';
import { throwError } from '@/shared/utils/throw-error';
import { getFolderDataQueryOptions } from '@/entities/folder-data';
import { QueryClient } from '@tanstack/react-query';

export const GalleryProvider = async ({
  children,
}: Omit<ComponentProps<typeof GalleryContextProvider>, 'initialFolderData'>) => {
  const headers = await _headers();
  const xPathname = headers.get('x-pathname') ?? throwError();

  const explorerPath = xPathname.startsWith('/explorer') ? xPathname.replace(/^\/explorer/, '') || '/' : null;

  const initialFolderData = isNil(explorerPath)
    ? null
    : await new QueryClient().fetchQuery(getFolderDataQueryOptions(explorerPath || '/'));

  return <GalleryContextProvider initialFolderData={initialFolderData}>{children}</GalleryContextProvider>;
};

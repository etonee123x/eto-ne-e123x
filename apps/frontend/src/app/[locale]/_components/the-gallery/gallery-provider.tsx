import { type ComponentProps } from 'react';
import { GalleryContextProvider } from './gallery-context-provider';
import { headers as _headers } from 'next/headers';
import { isNil } from '@/lib/utils/is-nil';
import { throwError } from '@/lib/utils/throw-error';
import { getFolderData } from '@/lib/queries/get-folder-data';

export const GalleryProvider = async ({
  children,
}: Omit<ComponentProps<typeof GalleryContextProvider>, 'initialFolderData'>) => {
  const headers = await _headers();
  const xPathname = headers.get('x-pathname') ?? throwError();

  const explorerPath = xPathname.startsWith('/explorer') ? xPathname.replace(/^\/explorer/, '') || '/' : null;

  const response = isNil(explorerPath) ? null : await getFolderData(explorerPath || '/');
  const initialFolderData = response?.data ?? null;

  return <GalleryContextProvider initialFolderData={initialFolderData}>{children}</GalleryContextProvider>;
};

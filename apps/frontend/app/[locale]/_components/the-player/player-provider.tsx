import { ComponentProps } from 'react';
import { PlayerContextProvider } from './player-context-provider';
import { headers as _headers } from 'next/headers';
import { getFolderData } from '../../explorer/[[...segments]]/_queries/get-folder-data';
import { isNil } from '@/lib/utils/is-nil';
import { throwError } from '@/lib/utils/throw-error';

export const PlayerProvider = async ({
  children,
}: Omit<ComponentProps<typeof PlayerContextProvider>, 'initialFolderData'>) => {
  const headers = await _headers();
  const xPathname = headers.get('x-pathname') ?? throwError();

  const explorerPath = xPathname.startsWith('/explorer') ? xPathname.replace(/^\/explorer/, '') || '/' : null;

  const response = isNil(explorerPath) ? null : await getFolderData(explorerPath || '/');
  const initialFolderData = response?.data ?? null;

  return <PlayerContextProvider initialFolderData={initialFolderData}>{children}</PlayerContextProvider>;
};

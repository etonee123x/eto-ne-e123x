import { type ComponentProps } from 'react';
import { PlayerContextProvider } from './player-context-provider';
import { headers as _headers } from 'next/headers';
import { isNil } from '@/shared/utils/is-nil';
import { throwError } from '@/shared/utils/throw-error';
import { getFolderData } from '@/entities/folder';

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

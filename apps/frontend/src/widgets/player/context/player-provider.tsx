import { type ComponentProps } from 'react';
import { PlayerProviderClient } from './player-provider-client';
import { headers as _headers } from 'next/headers';
import { isNil } from '@/shared/utils/is-nil';
import { getFolderDataQueryOptions } from '@/entities/folder-data';
import { QueryClient } from '@tanstack/react-query';

export const PlayerProvider = async ({
  children,
}: Omit<ComponentProps<typeof PlayerProviderClient>, 'initialFolderData'>) => {
  const headers = await _headers();
  // middleware may skip some paths (e.g. containing a dot), so x-pathname can be absent
  const xPathname = headers.get('x-pathname') ?? '/';

  const explorerPath = xPathname.startsWith('/explorer') ? xPathname.replace(/^\/explorer/, '') || '/' : null;

  const initialFolderData = isNil(explorerPath)
    ? null
    : await new QueryClient().fetchQuery(getFolderDataQueryOptions(explorerPath || '/')).catch(() => {
        return null;
      });

  return <PlayerProviderClient initialFolderData={initialFolderData}>{children}</PlayerProviderClient>;
};

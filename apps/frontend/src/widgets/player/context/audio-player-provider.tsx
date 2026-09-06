import { type ComponentProps } from 'react';
import { AudioPlayerProviderClient } from '@/entities/audio-player';
import { headers as _headers } from 'next/headers';
import { isNil } from '@/shared/utils/is-nil';
import { getFolderDataQueryOptions } from '@/entities/folder-data';
import { QueryClient } from '@tanstack/react-query';

export const AudioPlayerProvider = async ({
  children,
}: Omit<
  ComponentProps<typeof AudioPlayerProviderClient>,
  'initialTrack' | 'initialPlaylist' | 'initialPlaylistPathDirectory'
>) => {
  const headers = await _headers();
  // middleware may skip some paths (e.g. containing a dot), so x-pathname can be absent
  const xPathname = headers.get('x-pathname') ?? '/';

  const explorerPath = xPathname.startsWith('/explorer') ? xPathname.replace(/^\/explorer/, '') || '/' : null;

  const initialFolderData = isNil(explorerPath)
    ? null
    : await new QueryClient().query(getFolderDataQueryOptions(explorerPath || '/')).catch(() => {
        return null;
      });

  const track = initialFolderData?.file?.fileType === 'AUDIO' ? initialFolderData.file : null;
  const playlist =
    initialFolderData?.files.filter((file) => {
      return file.fileType === 'AUDIO';
    }) ?? [];

  const pathDirectory = initialFolderData?.pathDirectory ?? null;

  return (
    <AudioPlayerProviderClient
      initialTrack={track}
      initialPlaylist={playlist}
      initialPlaylistPathDirectory={pathDirectory}
    >
      {children}
    </AudioPlayerProviderClient>
  );
};

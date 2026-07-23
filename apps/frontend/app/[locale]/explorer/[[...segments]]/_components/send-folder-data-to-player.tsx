'use client';

import { usePlayerContext } from '@/app/[locale]/_components/the-player/player-context';
import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { components } from '@/lib/types/openapi';

export const SendFolderDataToPlayer = ({ folderData }: { folderData: components['schemas']['FolderDataResponse'] }) => {
  const { setTrack, setPlaylist, setPathDirectory } = usePlayerContext();

  setTrack(folderData.file?.fileType === FILE_TYPES.AUDIO ? folderData.file : null);
  setPlaylist(
    folderData.files.filter((file) => {
      return file.fileType === FILE_TYPES.AUDIO;
    }),
  );
  setPathDirectory(folderData.pathDirectory);

  return null;
};

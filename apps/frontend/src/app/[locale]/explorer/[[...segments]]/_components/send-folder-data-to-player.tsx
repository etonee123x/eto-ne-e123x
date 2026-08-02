'use client';

import { usePlayerContext } from '@/widgets/the-player/player-context';
import { FILE_TYPES } from '@/shared/utils/file-types';
import { type components } from '@/shared/api/openapi';
import { useEffect } from 'react';

export const SendFolderDataToPlayer = ({ folderData }: { folderData: components['schemas']['FolderDataResponse'] }) => {
  const { setTrack, setPlaylist, setPathDirectory } = usePlayerContext();

  useEffect(() => {
    setTrack(folderData.file?.fileType === FILE_TYPES.AUDIO ? folderData.file : null);
    setPlaylist(
      folderData.files.filter((file) => {
        return file.fileType === FILE_TYPES.AUDIO;
      }),
    );
    setPathDirectory(folderData.pathDirectory);
  }, [folderData, setPathDirectory, setPlaylist, setTrack]);

  return null;
};

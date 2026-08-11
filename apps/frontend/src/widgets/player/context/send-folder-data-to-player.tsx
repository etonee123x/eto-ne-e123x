'use client';

import { usePlayerContext } from './player-context';
import { FILE_TYPES } from '@/entities/file';
import { type components } from '@/shared/api/openapi';
import { useEffect } from 'react';

export const SendFolderDataToPlayer = ({ folderData }: { folderData: components['schemas']['FolderDataResponse'] }) => {
  const { setTrack, setPlaylist, setPathDirectory } = usePlayerContext();

  useEffect(() => {
    const fileAudio = folderData.file?.fileType === FILE_TYPES.AUDIO ? folderData.file : null;
    if (fileAudio) {
      setTrack(fileAudio);
    }

    setPlaylist(
      folderData.files.filter((file) => {
        return file.fileType === FILE_TYPES.AUDIO;
      }),
    );

    setPathDirectory(folderData.pathDirectory);
  }, [folderData, setPathDirectory, setPlaylist, setTrack]);

  return null;
};

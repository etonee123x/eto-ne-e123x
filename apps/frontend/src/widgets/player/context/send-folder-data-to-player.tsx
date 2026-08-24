'use client';

import { usePlayerContext } from './player-context';
import { FILE_TYPES } from '@/entities/file';
import { type components } from '@/shared/api/openapi';
import { useEffect } from 'react';

export const SendFolderDataToPlayer = ({ folderData }: { folderData: components['schemas']['FolderDataResponse'] }) => {
  const { open, setPathDirectory } = usePlayerContext();

  useEffect(() => {
    const fileAudio = folderData.file?.fileType === FILE_TYPES.AUDIO ? folderData.file : null;
    if (!fileAudio) {
      return;
    }

    open(
      fileAudio,
      folderData.files.filter((file) => {
        return file.fileType === FILE_TYPES.AUDIO;
      }),
      folderData.pathDirectory,
    );
  }, [folderData, open]);

  useEffect(() => {
    setPathDirectory(folderData.pathDirectory);

    return () => {
      setPathDirectory(null);
    };
  }, [folderData, setPathDirectory]);

  return null;
};

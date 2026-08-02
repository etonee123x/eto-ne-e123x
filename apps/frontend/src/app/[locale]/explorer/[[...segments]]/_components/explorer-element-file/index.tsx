import { type Link } from '@/i18n/navigation';
import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { type components } from '@/lib/types/openapi';
import { checkExhaustive } from '@/lib/utils/check-exhaustive';
import dynamic from 'next/dynamic';
import { type ComponentProps } from 'react';

const ExplorerElementFileAudio = dynamic(() => {
  return import('./explorer-element-file-audio').then((module) => {
    return module.ExplorerElementFileAudio;
  });
});

const ExplorerElementFileImage = dynamic(() => {
  return import('./explorer-element-file-image').then((module) => {
    return module.ExplorerElementFileImage;
  });
});

const ExplorerElementFileVideo = dynamic(() => {
  return import('./explorer-element-file-video').then((module) => {
    return module.ExplorerElementFileVideo;
  });
});

const ExplorerElementFileUnknown = dynamic(() => {
  return import('./explorer-element-file-unknown').then((module) => {
    return module.ExplorerElementFileUnknown;
  });
});

export const ExplorerElementFile = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemFile'] }) => {
  switch (element.fileType) {
    case FILE_TYPES.AUDIO: {
      return <ExplorerElementFileAudio element={element} {...props} />;
    }
    case FILE_TYPES.IMAGE: {
      return <ExplorerElementFileImage element={element} {...props} />;
    }
    case FILE_TYPES.VIDEO: {
      return <ExplorerElementFileVideo element={element} {...props} />;
    }
    case FILE_TYPES.UNKNOWN: {
      return <ExplorerElementFileUnknown element={element} {...props} />;
    }
    default: {
      throw checkExhaustive(element);
    }
  }
};

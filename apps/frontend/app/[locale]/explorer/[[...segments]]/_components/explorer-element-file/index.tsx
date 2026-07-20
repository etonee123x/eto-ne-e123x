import { Link } from '@/i18n/navigation';
import { FILE_TYPES } from '@/lib/helpers/folder-data';
import { components } from '@/lib/types/openapi';
import { checkExhaustive } from '@/lib/utils/check-exhaustive';
import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const ExplorerElementAudio = dynamic(() => {
  return import('./explorer-element-audio').then((module) => {
    return module.ExplorerElementAudio;
  });
});

const ExplorerElementImage = dynamic(() => {
  return import('./explorer-element-image').then((module) => {
    return module.ExplorerElementImage;
  });
});

const ExplorerElementVideo = dynamic(() => {
  return import('./explorer-element-video').then((module) => {
    return module.ExplorerElementVideo;
  });
});

const ExplorerElementUnknown = dynamic(() => {
  return import('./explorer-element-unknown').then((module) => {
    return module.ExplorerElementUnknown;
  });
});

export const ExplorerElementFile = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemFile'] }) => {
  switch (element.fileType) {
    case FILE_TYPES.AUDIO: {
      return <ExplorerElementAudio element={element} {...props} />;
    }
    case FILE_TYPES.IMAGE: {
      return <ExplorerElementImage element={element} {...props} />;
    }
    case FILE_TYPES.VIDEO: {
      return <ExplorerElementVideo element={element} {...props} />;
    }
    case FILE_TYPES.UNKNOWN: {
      return <ExplorerElementUnknown element={element} {...props} />;
    }
    default: {
      throw checkExhaustive(element);
    }
  }
};

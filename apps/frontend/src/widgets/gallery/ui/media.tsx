import { type components } from '@/shared/api/openapi';
import { FILE_TYPES } from '@/shared/utils/file-types';
import Image from 'next/image';

export const Media = ({
  media,
}: {
  media: components['schemas']['FolderDataItemImage'] | components['schemas']['FolderDataItemVideo'];
}) => {
  const props = {
    className: 'h-full w-full object-contain',
    width: media.metadata.width,
    height: media.metadata.height,
    src: media.src,
  };

  if (media.fileType === FILE_TYPES.IMAGE) {
    return <Image {...props} alt={media.name} />;
  }

  return <video {...props} controls autoPlay />;
};

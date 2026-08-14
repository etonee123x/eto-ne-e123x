import { BaseVideo } from '@/shared/ui/base-video';
import { type components } from '@/shared/api/openapi';
import type { ComponentProps } from 'react';

export const PostAttachmentVideo = ({
  attachment,
  ...props
}: Readonly<
  {
    attachment: components['schemas']['FolderDataItemVideo'];
  } & Omit<ComponentProps<typeof BaseVideo>, 'src' | 'width' | 'height'>
>) => {
  return (
    <BaseVideo src={attachment.src} width={attachment.metadata.width} height={attachment.metadata.height} {...props} />
  );
};

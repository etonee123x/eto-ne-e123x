import { BaseVideo } from '@/components/base-video';
import { components } from '@/lib/types/openapi';

export const PostAttachmentVideo = ({ attachment }: { attachment: components['schemas']['FolderDataItemVideo'] }) => {
  return <BaseVideo src={attachment.src} width={attachment.metadata.width} height={attachment.metadata.height} />;
};

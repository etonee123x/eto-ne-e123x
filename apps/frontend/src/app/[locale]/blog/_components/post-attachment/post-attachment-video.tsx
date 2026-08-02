import { BaseVideo } from '@/shared/ui/base-video';
import { type components } from '@/lib/types/openapi';

export const PostAttachmentVideo = ({ attachment }: { attachment: components['schemas']['FolderDataItemVideo'] }) => {
  return <BaseVideo src={attachment.src} width={attachment.metadata.width} height={attachment.metadata.height} />;
};

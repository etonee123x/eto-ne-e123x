import { type components } from '@/lib/types/openapi';

export const PostAttachmentAudio = ({ attachment }: { attachment: components['schemas']['FolderDataItemAudio'] }) => {
  return <audio src={attachment.src} controls />;
};

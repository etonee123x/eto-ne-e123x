import { type components } from '@/shared/api/openapi';

export const PostAttachmentAudio = ({ attachment }: { attachment: components['schemas']['FolderDataItemAudio'] }) => {
  return <audio src={attachment.src} controls />;
};

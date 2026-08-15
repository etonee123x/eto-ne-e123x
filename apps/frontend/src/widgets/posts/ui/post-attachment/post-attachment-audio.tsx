import { type components } from '@/shared/api/openapi';

export const PostAttachmentAudio = ({
  attachment,
}: Readonly<{
  attachment: components['schemas']['FolderDataItemAudio'];
}>) => {
  return <audio className="w-full" src={attachment.src} controls />;
};

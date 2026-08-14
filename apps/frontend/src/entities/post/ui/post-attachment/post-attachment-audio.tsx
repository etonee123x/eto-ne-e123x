import { type components } from '@/shared/api/openapi';
import type { ComponentProps } from 'react';

export const PostAttachmentAudio = ({
  attachment,
}: { attachment: components['schemas']['FolderDataItemAudio'] } & Omit<
  ComponentProps<'audio'>,
  'controls' | 'src'
>) => {
  return <audio src={attachment.src} controls />;
};

import { type components } from '@/shared/api/openapi';
import { FileQuestionMark } from 'lucide-react';
import type { ComponentProps } from 'react';

export const PostAttachmentUnknown = ({
  attachment,
}: {
  attachment: components['schemas']['FolderDataItemUnknown'];
} & Omit<ComponentProps<'a'>, 'href' | 'target' | 'rel' | 'className'>) => {
  return (
    <a href={attachment.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-end gap-0.5">
      <FileQuestionMark />
      {attachment.name}
    </a>
  );
};

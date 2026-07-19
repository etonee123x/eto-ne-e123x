import { components } from '@/lib/types/openapi';
import { FileQuestionMark } from 'lucide-react';

export const PostAttachmentUnknown = ({
  attachment,
}: {
  attachment: components['schemas']['FolderDataItemUnknown'];
}) => {
  return (
    <a href={attachment.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-end gap-0.5">
      <FileQuestionMark />
      {attachment.name}
    </a>
  );
};

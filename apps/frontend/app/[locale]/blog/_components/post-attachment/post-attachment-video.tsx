import { components } from '@/lib/types/openapi';
import { PlayCircle } from 'lucide-react';

export const PostAttachmentVideo = ({ attachment }: { attachment: components['schemas']['FolderDataItemVideo'] }) => {
  return (
    <div className="flex justify-center items-center max-w-full relative">
      <video
        className="max-w-full"
        src={attachment.src}
        width={attachment.metadata.width}
        height={attachment.metadata.height}
      />
      <PlayCircle className="absolute text-primary-500 size-1/3 pointer-events-none" />
    </div>
  );
};

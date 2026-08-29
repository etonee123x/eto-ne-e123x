import { BaseVideo } from '@/shared/ui/base-video';
import { type components } from '@/shared/api/openapi';

export const PostAttachmentVideo = ({
  attachment,
  onClick,
}: Readonly<{
  attachment: components['schemas']['StoredFileVideo'];
  onClick: () => void;
}>) => {
  return (
    <button className="self-start">
      <BaseVideo
        src={attachment.src}
        width={attachment.metadata.width}
        height={attachment.metadata.height}
        onClick={onClick}
      />
    </button>
  );
};

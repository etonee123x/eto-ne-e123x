import { type components } from '@/shared/api/openapi';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export const PostAttachmentImage = ({
  attachment,
  index,
}: {
  attachment: components['schemas']['FolderDataItemImage'];
  index: number;
}) => {
  const t = useTranslations('PostAttachmentImage');

  return (
    <Image
      src={attachment.src}
      width={attachment.metadata.width}
      height={attachment.metadata.height}
      alt={t('attachment', { index: index + 1 })}
      className="max-w-full"
    />
  );
};

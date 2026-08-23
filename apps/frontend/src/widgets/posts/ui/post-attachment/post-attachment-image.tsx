import { type components } from '@/shared/api/openapi';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export const PostAttachmentImage = ({
  attachment,
  index,
  onClick,
}: Readonly<{
  attachment: components['schemas']['FolderDataItemImage'];
  index: number;
  onClick: () => void;
}>) => {
  const t = useTranslations('PostAttachmentImage');

  return (
    <button className="self-start" onClick={onClick}>
      <Image
        src={attachment.src}
        width={attachment.metadata.width}
        height={attachment.metadata.height}
        alt={t('attachment', { index: index + 1 })}
      />
    </button>
  );
};

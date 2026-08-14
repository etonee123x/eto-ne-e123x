import { type components } from '@/shared/api/openapi';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { ComponentProps } from 'react';

export const PostAttachmentImage = ({
  attachment,
  index,
  ...props
}: Readonly<
  {
    attachment: components['schemas']['FolderDataItemImage'];
    index: number;
  } & Omit<ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height' | 'className'>
>) => {
  const t = useTranslations('PostAttachmentImage');

  return (
    <Image
      src={attachment.src}
      width={attachment.metadata.width}
      height={attachment.metadata.height}
      alt={t('attachment', { index: index + 1 })}
      className="max-w-full cursor-pointer"
      {...props}
    />
  );
};

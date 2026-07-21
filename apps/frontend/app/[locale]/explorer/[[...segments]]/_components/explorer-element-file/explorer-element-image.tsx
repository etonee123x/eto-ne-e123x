import { Item, ItemHeader, ItemMedia } from '@/components/ui/item';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { components } from '@/lib/types/openapi';
import { ComponentProps } from 'react';

export const ExplorerElementImage = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemImage'] }) => {
  return (
    <Item className="border-primary" variant="outline" render={<Link {...props} />}>
      <ItemHeader className="text-xl">{element.name}</ItemHeader>
      <ItemMedia className="mx-auto max-w-full">
        <Image src={element.src} alt={element.name} width={element.metadata.width} height={element.metadata.height} />
      </ItemMedia>
    </Item>
  );
};

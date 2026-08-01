import { Item, ItemHeader, ItemMedia } from '@/components/ui/item';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { type components } from '@/lib/types/openapi';
import { type ComponentProps } from 'react';
import { Separator } from '@/components/ui/separator';
import { ExplorerElementTime } from './explorer-element-time';

export const ExplorerElementFileImage = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemImage'] }) => {
  return (
    <article className="contents">
      <Item className="border-primary" variant="outline" render={<Link {...props} />}>
        <ItemHeader>
          <header className="text-lg">{element.name}</header>
          <ExplorerElementTime element={element} />
        </ItemHeader>
        <Separator />
        <ItemMedia className="mx-auto max-w-full">
          <Image src={element.src} alt={element.name} width={element.metadata.width} height={element.metadata.height} />
        </ItemMedia>
      </Item>
    </article>
  );
};

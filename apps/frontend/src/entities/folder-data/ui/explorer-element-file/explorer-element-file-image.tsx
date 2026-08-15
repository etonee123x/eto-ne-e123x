import { Item, ItemHeader, ItemMedia } from '@/shared/ui/ds/item';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { type ComponentProps } from 'react';
import { Separator } from '@/shared/ui/ds/separator';
import { ExplorerElementTime } from './explorer-element-time';

export const ExplorerElementFileImage = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemImage'] }) => {
  return (
    <article className="contents">
      <Item className="border-primary" variant="outline" render={<Link {...props} scroll={false} />}>
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

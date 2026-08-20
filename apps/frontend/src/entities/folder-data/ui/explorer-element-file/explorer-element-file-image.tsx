import { Item, ItemMedia } from '@/shared/ui/ds/item';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { type ComponentProps } from 'react';
import { Separator } from '@/shared/ui/ds/separator';
import { ExplorerElementHeader } from '../explorer-element-header';

export const ExplorerElementFileImage = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemImage'] }) => {
  return (
    <article className="contents">
      <Item className="border-primary" variant="outline" render={<Link {...props} scroll={false} />}>
        <ExplorerElementHeader name={element.name} createdAt={element._meta.createdAt} />
        <Separator />
        <ItemMedia className="mx-auto max-w-full">
          <Image src={element.src} alt={element.name} width={element.metadata.width} height={element.metadata.height} />
        </ItemMedia>
      </Item>
    </article>
  );
};

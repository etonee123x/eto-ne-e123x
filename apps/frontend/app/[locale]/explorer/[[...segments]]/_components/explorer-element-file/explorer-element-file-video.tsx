import { BaseVideo } from '@/components/base-video';
import { Item, ItemContent, ItemHeader, ItemMedia } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';
import { components } from '@/lib/types/openapi';
import { ComponentProps } from 'react';
import { ExplorerElementTime } from './explorer-element-time';

export const ExplorerElementFileVideo = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemVideo'] }) => {
  return (
    <article className="contents">
      <Item className="border-primary" variant="outline" render={<Link {...props} />}>
        <ItemHeader>
          <header className="text-lg">{element.name}</header>
          <ExplorerElementTime element={element} />
        </ItemHeader>
        <Separator />
        <ItemContent>
          <ItemMedia>
            <BaseVideo src={element.src} width={element.metadata.width} height={element.metadata.height} />
          </ItemMedia>
        </ItemContent>
      </Item>
    </article>
  );
};

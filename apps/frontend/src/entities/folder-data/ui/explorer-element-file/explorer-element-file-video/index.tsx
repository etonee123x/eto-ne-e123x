import { Item, ItemContent, ItemMedia } from '@/shared/ui/ds/item';
import { Separator } from '@/shared/ui/ds/separator';
import { Link } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { type ComponentProps } from 'react';
import { ExplorerElementHeader } from '../../explorer-element-header';
import { Video } from './video';

export const ExplorerElementFileVideo = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemVideo'] }) => {
  return (
    <article className="contents">
      <Item className="border-primary" variant="outline" render={<Link {...props} scroll={false} />}>
        <ExplorerElementHeader name={element.name} createdAt={element._meta.createdAt} />
        <Separator />
        <ItemContent>
          <ItemMedia>
            <Video src={element.src} width={element.metadata.width} height={element.metadata.height} />
          </ItemMedia>
        </ItemContent>
      </Item>
    </article>
  );
};

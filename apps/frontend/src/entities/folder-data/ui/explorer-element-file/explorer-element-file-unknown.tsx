import { Item } from '@/shared/ui/ds/item';
import { Link } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { type ComponentProps } from 'react';
import { ExplorerElementHeader } from '../explorer-element-header';

export const ExplorerElementFileUnknown = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemUnknown'] }) => {
  return (
    <article className="contents">
      <Item className="border-primary" variant="outline" render={<Link {...props} />}>
        <ExplorerElementHeader name={element.name} createdAt={element._meta.createdAt} />
      </Item>
    </article>
  );
};

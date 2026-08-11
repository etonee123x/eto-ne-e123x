import { Item, ItemHeader } from '@/shared/ui/ds/item';
import { Link } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { type ComponentProps } from 'react';
import { ExplorerElementTime } from './explorer-element-time';

export const ExplorerElementFileUnknown = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemUnknown'] }) => {
  return (
    <article className="contents">
      <Item className="border-primary" variant="outline" render={<Link {...props} />}>
        <ItemHeader>
          <header className="text-lg">{element.name}</header>
          <ExplorerElementTime element={element} />
        </ItemHeader>
      </Item>
    </article>
  );
};

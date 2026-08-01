import { Item, ItemHeader } from '@/components/ui/item';
import { Link } from '@/i18n/navigation';
import { type components } from '@/lib/types/openapi';
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

import { Item, ItemHeader } from '@/shared/ui/ds/item';
import { Link } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { type ComponentProps } from 'react';
import { ExplorerElementTime } from './explorer-element-file/explorer-element-time';

export const ExplorerElementFolder = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemFolder'] }) => {
  return (
    <Item className="border-primary" variant="muted" render={<Link {...props} />}>
      <ItemHeader>
        <header className="text-lg">{element.name}</header>
        <ExplorerElementTime element={element} />
      </ItemHeader>
    </Item>
  );
};

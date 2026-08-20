import { Item } from '@/shared/ui/ds/item';
import { Link } from '@/i18n/navigation';
import { type components } from '@/shared/api/openapi';
import { type ComponentProps } from 'react';
import { ExplorerElementHeader } from './explorer-element-header';

export const ExplorerElementFolder = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemFolder'] }) => {
  return (
    <Item className="border-primary" variant="muted" render={<Link {...props} />}>
      <ExplorerElementHeader name={element.name} createdAt={element._meta.createdAt} />
    </Item>
  );
};

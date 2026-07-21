import { Item, ItemHeader } from '@/components/ui/item';
import { Link } from '@/i18n/navigation';
import { components } from '@/lib/types/openapi';
import { ComponentProps } from 'react';

export const ExplorerElementFolder = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemFolder'] }) => {
  return (
    <Item className="border-primary" variant="muted" render={<Link {...props} />}>
      <ItemHeader className="text-lg">{element.name}</ItemHeader>
    </Item>
  );
};

import { Item, ItemHeader } from '@/components/ui/item';
import { Link } from '@/i18n/navigation';
import { components } from '@/lib/types/openapi';
import { ComponentProps } from 'react';

export const ExplorerElementVideo = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemVideo'] }) => {
  return (
    <Item variant="outline" render={<Link {...props} />}>
      <ItemHeader>{element.name}</ItemHeader>
    </Item>
  );
};

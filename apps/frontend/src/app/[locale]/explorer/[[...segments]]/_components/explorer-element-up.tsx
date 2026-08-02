import { Item, ItemHeader } from '@/shared/ui/ds/item';
import { Link } from '@/i18n/navigation';
import { type ComponentProps } from 'react';

export const ExplorerElementUp = ({ ...props }: ComponentProps<typeof Link>) => {
  return (
    <Item className="border-primary" variant="muted" render={<Link {...props} />}>
      <ItemHeader className="text-lg">...</ItemHeader>
    </Item>
  );
};

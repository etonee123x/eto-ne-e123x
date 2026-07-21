import { Item, ItemHeader } from '@/components/ui/item';
import { Link } from '@/i18n/navigation';
import { ComponentProps } from 'react';

export const ExplorerElementUp = ({ ...props }: ComponentProps<typeof Link>) => {
  return (
    <Item className="border-primary" variant="muted" render={<Link {...props} />}>
      <ItemHeader className="text-lg">...</ItemHeader>
    </Item>
  );
};

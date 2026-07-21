import { BaseVideo } from '@/components/base-video';
import { Item, ItemContent, ItemHeader, ItemMedia } from '@/components/ui/item';
import { Link } from '@/i18n/navigation';
import { components } from '@/lib/types/openapi';
import { ComponentProps } from 'react';

export const ExplorerElementVideo = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemVideo'] }) => {
  return (
    <Item className="border-primary" variant="outline" render={<Link {...props} />}>
      <ItemHeader className="text-lg">{element.name}</ItemHeader>
      <ItemContent>
        <ItemMedia>
          <BaseVideo src={element.src} width={element.metadata.width} height={element.metadata.height} />
        </ItemMedia>
      </ItemContent>
    </Item>
  );
};

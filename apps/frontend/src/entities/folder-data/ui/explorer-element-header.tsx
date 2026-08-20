import { ItemHeader } from '@/shared/ui/ds/item';
import { useFormatter, useNow } from 'next-intl';
import type { components } from '@/shared/api/openapi';

type Element = components['schemas']['FolderDataItemFile'] | components['schemas']['FolderDataItemFolder'];

const ExplorerElementTime = ({ createdAt }: { createdAt: Element['_meta']['createdAt'] }) => {
  const { relativeTime } = useFormatter();
  const now = useNow();

  return (
    <time
      className="text-muted-foreground shrink-0"
      suppressHydrationWarning
      dateTime={new Date(createdAt).toISOString()}
    >
      {relativeTime(createdAt, now)}
    </time>
  );
};

export const ExplorerElementHeader = ({
  name,
  createdAt,
}: {
  name: Element['name'];
  createdAt: Element['_meta']['createdAt'];
}) => {
  return (
    <ItemHeader className="min-w-0">
      <header className="truncate text-lg">{name}</header>
      <ExplorerElementTime createdAt={createdAt} />
    </ItemHeader>
  );
};

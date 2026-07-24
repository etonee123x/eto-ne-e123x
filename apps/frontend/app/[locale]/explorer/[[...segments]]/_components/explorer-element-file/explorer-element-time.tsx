import { components } from '@/lib/types/openapi';
import { useFormatter, useNow } from 'next-intl';

export const ExplorerElementTime = ({
  element,
}: {
  element: components['schemas']['FolderDataItemFile'] | components['schemas']['FolderDataItemFolder'];
}) => {
  const { relativeTime } = useFormatter();
  const now = useNow();

  return (
    <time className="text-muted-foreground" dateTime={new Date(element._meta.createdAt).toISOString()}>
      {relativeTime(element._meta.createdAt, now)}
    </time>
  );
};

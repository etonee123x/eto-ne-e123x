import { type components } from '@/shared/api/openapi';
import { useFormatter, useNow } from 'next-intl';

export const ExplorerElementTime = ({
  element,
}: {
  element: components['schemas']['FolderDataItemFile'] | components['schemas']['FolderDataItemFolder'];
}) => {
  const { relativeTime } = useFormatter();
  const now = useNow();

  return (
    <time
      className="text-muted-foreground"
      suppressHydrationWarning
      dateTime={new Date(element._meta.createdAt).toISOString()}
    >
      {relativeTime(element._meta.createdAt, now)}
    </time>
  );
};

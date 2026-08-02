'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDeletePost } from './delete-post-context';
import type { components } from '@/lib/types/openapi';

export const ButtonDeletePost = ({ id }: { id: components['schemas']['PostResponse']['_meta']['id'] }) => {
  const { requestDeletePostById } = useDeletePost();
  const t = useTranslations('PostDelete');

  return (
    <Button
      aria-label={t('delete')}
      className="ms-auto"
      onClick={() => {
        requestDeletePostById(id);
      }}
      title={t('delete')}
      variant="destructive"
    >
      <Trash2 />
    </Button>
  );
};

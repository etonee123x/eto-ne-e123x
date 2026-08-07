'use client';

import { Button } from '@/shared/ui/ds/button';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDeletePostContext } from '../context/delete-post-context';
import type { components } from '@/shared/api/openapi';

export const ButtonDeletePost = ({ postId }: { postId: components['schemas']['PostResponse']['_meta']['id'] }) => {
  const { requestDeletePostById } = useDeletePostContext();
  const t = useTranslations('ButtonDeletePost');

  return (
    <Button
      aria-label={t('delete')}
      onClick={() => {
        requestDeletePostById(postId);
      }}
      title={t('delete')}
      variant="destructive"
    >
      <Trash2 />
    </Button>
  );
};

'use client';

import { Button } from '@/shared/ui/ds/button';
import { Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEditPostContext } from '../context/edit-post-context';
import type { components } from '@/shared/api/openapi';

export const ButtonEditPost = ({ postId }: { postId: components['schemas']['PostResponse']['_meta']['id'] }) => {
  const { enterEditPostById } = useEditPostContext();
  const t = useTranslations('ButtonEditPost');

  return (
    <Button
      aria-label={t('edit')}
      onClick={() => {
        enterEditPostById(postId);
      }}
      title={t('edit')}
      variant="secondary"
    >
      <Edit2 />
    </Button>
  );
};

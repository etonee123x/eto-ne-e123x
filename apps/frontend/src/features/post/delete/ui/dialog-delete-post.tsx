'use client';

import { Button } from '@/shared/ui/ds/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/ds/dialog';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useDeletePostContext } from '../context/delete-post-context';
import { isNil } from '@/shared/utils/is-nil';

export const DialogDeletePost = () => {
  const { closeDeletePost, postId, deletePostById } = useDeletePostContext();
  const router = useRouter();
  const t = useTranslations('PostDelete');

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      return;
    }

    closeDeletePost();
  };

  const onClickDelete = async () => {
    if (isNil(postId)) {
      return;
    }

    await deletePostById(postId);

    router.refresh();
  };

  return (
    <Dialog open={!isNil(postId)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={closeDeletePost} variant="outline">
            {t('cancel')}
          </Button>
          <Button onClick={onClickDelete} variant="destructive">
            {t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

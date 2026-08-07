'use client';

import { PostAttachment } from '@/entities/post';
import { useIsAdmin } from '@/entities/session/client';
import { useDeletePostContext } from '@/features/post/delete';
import { FormPostUpdate, useEditPostContext } from '@/features/post/editor';
import { Link } from '@/i18n/navigation';
import type { components } from '@/shared/api/openapi';
import { BaseHtml } from '@/shared/ui/base-html';
import { Button } from '@/shared/ui/ds/button';
import { Card, CardContent, CardFooter } from '@/shared/ui/ds/card';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import { useFormatter, useNow, useTranslations } from 'next-intl';

export const Post = ({
  post,
  // selectedPostId,
}: {
  post: components['schemas']['PostResponse'];
  selectedPostId?: string;
}) => {
  const t = useTranslations('Post');

  const { postId, enterEditPostById, exitEditPost } = useEditPostContext();
  const { requestDeletePostById } = useDeletePostContext();

  const isAdmin = useIsAdmin();

  const { relativeTime } = useFormatter();
  const now = useNow();

  const isEditing = postId === post._meta.id;

  return (
    <Card key={post._meta.id}>
      <CardContent className="flex flex-col gap-2">
        {isEditing ? (
          <FormPostUpdate post={post} />
        ) : (
          <>
            <BaseHtml html={post.text} />
            {post.attachments.map((attachment, index) => {
              return <PostAttachment key={index} attachment={attachment} index={index} />;
            })}
            <Link
              href={`/blog/${post._meta.id}`}
              className="self-end hover:underline text-sm flex items-center gap-0.5 text-muted-foreground"
            >
              <time dateTime={new Date(post._meta.createdAt).toISOString()} className="contents">
                {relativeTime(post._meta.createdAt, now)}
                {post._meta.updatedAt !== post._meta.createdAt && <Edit2 />}
              </time>
            </Link>
          </>
        )}
      </CardContent>
      {isAdmin && (
        <CardFooter className="justify-end gap-2">
          {isEditing ? (
            <>
              <Button aria-label={t('confirm')} title={t('confirm')}>
                <Check />
              </Button>
              <Button
                onClick={() => {
                  exitEditPost();
                }}
                aria-label={t('cancel')}
                title={t('cancel')}
                variant="secondary"
              >
                <X />
              </Button>
            </>
          ) : (
            <>
              <Button
                aria-label={t('edit')}
                onClick={() => {
                  enterEditPostById(post._meta.id);
                }}
                title={t('edit')}
                variant="secondary"
              >
                <Edit2 />
              </Button>
              <Button
                aria-label={t('delete')}
                onClick={() => {
                  requestDeletePostById(post._meta.id);
                }}
                title={t('delete')}
                variant="destructive"
              >
                <Trash2 />
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

'use client';

import { PostAttachment } from '@/entities/post';
import { useIsAdmin } from '@/entities/session/client';
import { ButtonDeletePost } from '@/features/post/delete';
import { ButtonEditPost } from '@/features/post/editor';
import { Link } from '@/i18n/navigation';
import type { components } from '@/shared/api/openapi';
import { BaseHtml } from '@/shared/ui/base-html';
import { Card, CardContent, CardFooter } from '@/shared/ui/ds/card';
import { Edit2 } from 'lucide-react';
import { useFormatter, useNow } from 'next-intl';

export const Post = ({ post }: { post: components['schemas']['PostResponse'] }) => {
  const isAdmin = useIsAdmin();

  const { relativeTime } = useFormatter();
  const now = useNow();

  return (
    <Card key={post._meta.id}>
      <CardContent className="flex flex-col gap-2">
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
      </CardContent>
      {isAdmin && (
        <CardFooter className="justify-end gap-2">
          <ButtonEditPost postId={post._meta.id} />
          <ButtonDeletePost postId={post._meta.id} />
        </CardFooter>
      )}
    </Card>
  );
};

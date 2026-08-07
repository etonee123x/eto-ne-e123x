import { BaseHtml } from '@/shared/ui/base-html';
import { Card, CardContent, CardFooter } from '@/shared/ui/ds/card';
import { client } from '@/shared/api/client';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Separator } from '@/shared/ui/ds/separator';
import { getIsAdmin } from '@/entities/session';
import { ButtonDeletePost, DeletePostProvider } from '@/features/post/delete';
import { PostAttachment } from '@/entities/post';
import { ButtonEditPost, EditPostProvider } from '@/features/post/editor';

const FormPostCreate = dynamic(() => {
  return import('@/features/post/editor').then((module) => {
    return module.FormPostCreate;
  });
});

const DialogDeletePost = dynamic(() => {
  return import('@/features/post/delete').then((module) => {
    return module.DialogDeletePost;
  });
});

export default async function Blog() {
  const { data: posts } = await client['/posts'].GET();

  const isAdmin = await getIsAdmin();

  if (!posts) {
    return notFound();
  }

  const t = await getTranslations('Blog');

  return (
    <DeletePostProvider>
      <EditPostProvider>
        <section className="layout-container">
          <h1 className="h1 mb-4">{t('blog')}</h1>
          {isAdmin && (
            <>
              <FormPostCreate />
              <Separator className="my-4" />
            </>
          )}
          <div className="flex flex-col gap-4">
            {posts.rows.map((post) => {
              return (
                <Card key={post._meta.id}>
                  <CardContent>
                    <BaseHtml html={post.text} />
                    {post.attachments.map((attachment, index) => {
                      return <PostAttachment key={index} attachment={attachment} index={index} />;
                    })}
                  </CardContent>
                  {isAdmin && (
                    <CardFooter className="justify-end gap-2">
                      <ButtonEditPost postId={post._meta.id} />
                      <ButtonDeletePost postId={post._meta.id} />
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
          {isAdmin && <DialogDeletePost />}
        </section>
      </EditPostProvider>
    </DeletePostProvider>
  );
}

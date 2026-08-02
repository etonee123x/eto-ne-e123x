import { BaseHtml } from '@/shared/ui/base-html';
import { Card, CardContent, CardFooter } from '@/shared/ui/ds/card';
import { client } from '@/shared/api/client';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PostAttachment from './_components/post-attachment';
import dynamic from 'next/dynamic';
import { Separator } from '@/shared/ui/ds/separator';
import { getIsAdmin } from '@/shared/is-admin/get-is-admin';
import { ButtonDeletePost } from './_components/button-delete-post';
import { DeletePostProvider } from './_components/delete-post-context';

const FormPostCreate = dynamic(() => {
  return import('./_components/form-post/form-post-create').then((module) => {
    return module.FormPostCreate;
  });
});

const DialogDeletePost = dynamic(() => {
  return import('./_components/dialog-delete-post').then((module) => {
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
                  <CardFooter>
                    <ButtonDeletePost id={post._meta.id} />
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
        {isAdmin && <DialogDeletePost />}
      </section>
    </DeletePostProvider>
  );
}

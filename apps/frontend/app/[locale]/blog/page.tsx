import { BaseHtml } from '@/components/base-html';
import { Card, CardContent } from '@/components/ui/card';
import { client } from '@/lib/api/client';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PostAttachment from './_components/post-attachment';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getIsAdmin } from '@/lib/auth/get-is-admin';

const FormPostCreate = dynamic(() => {
  return import('./_components/form-post/form-post-create').then((module) => {
    return module.FormPostCreate;
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
            </Card>
          );
        })}
      </div>
    </section>
  );
}

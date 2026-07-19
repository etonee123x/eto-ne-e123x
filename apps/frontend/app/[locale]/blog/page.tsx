import { BaseHtml } from '@/components/ui/base-html';
import { Card, CardContent } from '@/components/ui/card';
import { client } from '@/lib/api/client';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PostAttachment from './_components/post-attachment';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const FormPost = dynamic(() => {
  return import('./_components/form-post').then((module) => {
    return module.FormPost;
  });
});

export default async function Blog() {
  const { data: posts } = await client['/posts'].GET();

  if (!posts) {
    return notFound();
  }

  const t = await getTranslations('Blog');

  return (
    <section className="layout-container">
      <h1 className="h1 mb-2">{t('blog')}</h1>
      <>
        <FormPost id="form-post" className="mb-4" />
        <Button className="w-full" form="form-post">
          {t('send')}
        </Button>
        <Separator className="my-4" />
      </>
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

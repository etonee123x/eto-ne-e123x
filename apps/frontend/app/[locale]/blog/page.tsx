import { BaseHtml } from '@/components/ui/base-html';
import { Card, CardContent } from '@/components/ui/card';
import { client } from '@/lib/api/client';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function Blog() {
  const { data: posts } = await client['/posts'].GET();

  if (!posts) {
    return notFound();
  }

  const t = await getTranslations('Blog');

  return (
    <section className="layout-container">
      <h1 className="h1 mb-2">{t('blog')}</h1>
      <div className="flex flex-col gap-4">
        {posts.rows.map((post) => {
          return (
            <Card key={post._meta.id}>
              <CardContent>
                <BaseHtml html={post.text} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

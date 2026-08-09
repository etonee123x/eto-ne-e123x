import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Separator } from '@/shared/ui/ds/separator';
import { getIsAdmin } from '@/entities/session/server';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { infiniteQueryOptionsGetPosts } from '@/entities/post';
import { Posts } from '@/widgets/posts';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/ds/empty';

const FormPostCreate = dynamic(() => {
  return import('@/features/post/editor').then((module) => {
    return module.FormPostCreate;
  });
});

export default async function Blog({ params }: Readonly<PageProps<'/[locale]/blog/[[...postIdAsSegmentsCrutchWFT]]'>>) {
  const { postIdAsSegmentsCrutchWFT } = await params;

  if (postIdAsSegmentsCrutchWFT && postIdAsSegmentsCrutchWFT.length > 1) {
    return notFound();
  }

  const postId = postIdAsSegmentsCrutchWFT?.[0] ?? null;

  const queryClient = new QueryClient();
  const posts = await queryClient.fetchInfiniteQuery(infiniteQueryOptionsGetPosts(postId));

  const hasPosts = posts.pages.some((page) => {
    return page.rows.length > 0;
  });

  const isAdmin = await getIsAdmin();

  const t = await getTranslations('Blog');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="layout-container">
        <h1 className="h1 mb-4">{t('blog')}</h1>
        {isAdmin && (
          <>
            <FormPostCreate />
            <Separator className="my-4" />
          </>
        )}
        {hasPosts ? (
          <Posts selectedPostId={postId} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t('noPosts')}</EmptyTitle>
              <EmptyDescription>{t('noPostsFound')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </HydrationBoundary>
  );
}

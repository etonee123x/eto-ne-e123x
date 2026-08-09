import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Separator } from '@/shared/ui/ds/separator';
import { getIsAdmin } from '@/entities/session/server';
import { DeletePostProvider } from '@/features/post/delete';
import { EditPostProvider } from '@/features/post/editor';
import { Post } from '@/widgets/post';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { postsQueryOptions } from '@/widgets/post/queries/use-query-posts';

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

export default async function Blog({ params }: Readonly<PageProps<'/[locale]/blog/[[...postIdAsSegmentsCrutchWFT]]'>>) {
  const { postIdAsSegmentsCrutchWFT } = await params;

  if (postIdAsSegmentsCrutchWFT && postIdAsSegmentsCrutchWFT.length > 1) {
    return notFound();
  }

  const postId = postIdAsSegmentsCrutchWFT?.[0];

  const queryClient = new QueryClient();
  const posts = await queryClient.fetchQuery(postsQueryOptions());

  const isAdmin = await getIsAdmin();

  const t = await getTranslations('Blog');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
                return <Post selectedPostId={postId} {...{ post }} key={post._meta.id} />;
              })}
            </div>
            {isAdmin && <DialogDeletePost />}
          </section>
        </EditPostProvider>
      </DeletePostProvider>
    </HydrationBoundary>
  );
}

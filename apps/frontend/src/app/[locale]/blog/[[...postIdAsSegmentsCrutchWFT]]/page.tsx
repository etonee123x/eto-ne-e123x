import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Separator } from '@/shared/ui/ds/separator';
import { getIsAdmin } from '@/entities/session/server';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { infiniteQueryOptionsGetPosts } from '@/entities/post';
import { Posts } from '@/widgets/posts';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/ds/empty';
import type { Metadata } from 'next';
import { isNil } from '@/shared/utils/is-nil';

const FormPostCreate = dynamic(() => {
  return import('@/features/post/editor').then((module) => {
    return module.FormPostCreate;
  });
});

export const generateMetadata = async ({
  params,
}: Readonly<PageProps<'/[locale]/blog/[[...postIdAsSegmentsCrutchWFT]]'>>): Promise<Metadata> => {
  const t = await getTranslations('Blog');

  const defaults = {
    title: t('blog'),
  };

  const { postIdAsSegmentsCrutchWFT } = await params;
  if (postIdAsSegmentsCrutchWFT && postIdAsSegmentsCrutchWFT.length > 1) {
    throw new Error('Invalid postIdAsSegmentsCrutchWFT length');
  }

  const postId = postIdAsSegmentsCrutchWFT?.[0] ?? null;

  if (isNil(postId)) {
    return {
      ...defaults,
      description: t('myBlog'),
    };
  }

  const queryClient = new QueryClient();
  const posts = await queryClient.fetchInfiniteQuery(infiniteQueryOptionsGetPosts(postId));

  const post = posts.pages
    .flatMap((page) => {
      return page.rows;
    })
    .find((post) => {
      return post._meta.id === postId;
    });

  if (!post) {
    throw new Error('Post not found');
  }

  if (!post.text) {
    return {
      ...defaults,
      description: t('postInMyBlog'),
    };
  }

  const max = 140;
  const text = post.text.replaceAll(/\n+/g, ' ').replaceAll(/\s+/g, ' ').trim();

  if (text.length <= max) {
    return {
      ...defaults,
      description: text,
    };
  }

  const textSliced = text.slice(0, max);
  const indexOfLastSpace = textSliced.lastIndexOf(' ');

  if (indexOfLastSpace === -1) {
    return {
      ...defaults,
      description: textSliced.slice(0, max - 1) + '…',
    };
  }

  return {
    ...defaults,
    description: textSliced.slice(0, indexOfLastSpace) + '…',
  };
};

export default async function Blog({ params }: Readonly<PageProps<'/[locale]/blog/[[...postIdAsSegmentsCrutchWFT]]'>>) {
  const { postIdAsSegmentsCrutchWFT } = await params;

  if (postIdAsSegmentsCrutchWFT && postIdAsSegmentsCrutchWFT.length > 1) {
    return notFound();
  }

  const postId = postIdAsSegmentsCrutchWFT?.[0] ?? null;

  const queryClient = new QueryClient();
  const posts = await queryClient.fetchInfiniteQuery(infiniteQueryOptionsGetPosts(postId)).catch(() => {
    return undefined;
  });
  if (!posts) {
    return notFound();
  }

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

'use client';

import { PostAttachment, useInfiniteQueryGetPosts, useMutationPatchPostById } from '@/entities/post';
import { useIsAdminContext } from '@/entities/session/client';
import { DeletePostProvider, useDeletePostContext } from '@/features/post/delete';
import { EditPostProvider, FormPost, useEditPostContext, type FormPostRef } from '@/features/post/editor';
import { Link, useRouter } from '@/i18n/navigation';
import type { components } from '@/shared/api/openapi';
import { BaseHtml } from '@/shared/ui/base-html';
import { Button } from '@/shared/ui/ds/button';
import { Card, CardContent, CardFooter } from '@/shared/ui/ds/card';
import { Marker, MarkerContent } from '@/shared/ui/ds/marker';
import { Spinner } from '@/shared/ui/ds/spinner';
import { isClient } from '@/shared/utils/target';
import { MessageScroller } from '@shadcn/react/message-scroller';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { useInfiniteScroll } from '@reactuses/core';

const DialogDeletePost = dynamic(() => {
  return import('@/features/post/delete').then((module) => {
    return module.DialogDeletePost;
  });
});

const Post = ({
  post,
  // selectedPostId,
}: {
  post: components['schemas']['PostResponse'];
  selectedPostId: components['schemas']['PostResponse']['_meta']['id'] | null;
}) => {
  const t = useTranslations('Post');

  const router = useRouter();

  const { postId, enterEditPostById, exitEditPost } = useEditPostContext();
  const { requestDeletePostById } = useDeletePostContext();

  const { isAdmin } = useIsAdminContext();

  const { relativeTime } = useFormatter();
  const now = useNow();
  const formPostRef = useRef<FormPostRef>(null);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const formPostId = `form-update-post-${post._meta.id}`;

  const isEditing = postId === post._meta.id;

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    formPostRef.current?.focusTextarea();
  }, [isEditing]);

  const onSubmitWithoutChanges = () => {
    exitEditPost();
  };

  const onValidityChange: ComponentProps<typeof FormPost>['onValidityChange'] = (isValid) => {
    setIsEditFormValid(isValid);
  };

  const mutationPatchPostById = useMutationPatchPostById();

  const onSubmit: ComponentProps<typeof FormPost>['onSubmit'] = async (...[, _post, files]) => {
    await mutationPatchPostById.mutateAsync({
      id: post._meta.id,
      data: _post,
      files,
    });

    exitEditPost();

    router.refresh();
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        {isEditing ? (
          <FormPost
            id={formPostId}
            ref={formPostRef}
            defaultValues={{
              text: post.text,
              attachments: post.attachments,
            }}
            {...{
              post,
              onValidityChange,
              onSubmitWithoutChanges,
              onSubmit,
            }}
          />
        ) : (
          <>
            <BaseHtml html={post.text} />
            {post.attachments.map((attachment, index) => {
              return <PostAttachment key={index} attachment={attachment} index={index} />;
            })}
            <Link
              href={`/blog/${post._meta.id}`}
              className="self-end hover:underline flex items-center gap-1 text-muted-foreground"
            >
              <time dateTime={new Date(post._meta.createdAt).toISOString()} className="contents">
                {relativeTime(post._meta.createdAt, now)}
                {post._meta.updatedAt !== post._meta.createdAt && <Edit2 className="size-3.5" />}
              </time>
            </Link>
          </>
        )}
      </CardContent>
      {isAdmin && (
        <CardFooter className="justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                key="confirm"
                aria-label={t('confirm')}
                title={t('confirm')}
                type="submit"
                form={formPostId}
                disabled={!isEditFormValid}
              >
                <Check />
              </Button>
              <Button
                key="cancel"
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
                key="edit"
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
                key="delete"
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

export const Posts = ({
  selectedPostId,
}: {
  selectedPostId: components['schemas']['PostResponse']['_meta']['id'] | null;
}) => {
  const t = useTranslations('Post');
  // const { y } = useWindowScroll();
  const { isAdmin } = useIsAdminContext();

  const {
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    data: infiniteQueryGetPostsData,
  } = useInfiniteQueryGetPosts(selectedPostId);

  const posts =
    infiniteQueryGetPostsData?.pages.flatMap((page) => {
      return page.rows;
    }) ?? [];

  useInfiniteScroll(
    () => {
      return isClient ? document.scrollingElement : null;
    },
    async ([, , isScrolling]) => {
      console.log('scrolling top', isScrolling);
      if (isFetchingNextPage || !hasNextPage) {
        return;
      }

      if (!isScrolling) {
        return;
      }

      try {
        await fetchNextPage();
      } catch {
        // чтобы не спамить запросами при ошибке (когда нет интернета)
        await new Promise((resolve) => {
          return setTimeout(resolve, 1000);
        });
      }
    },
    {
      distance: isClient ? globalThis.innerHeight / 2 : 0,
      direction: 'top',
    },
  );

  useInfiniteScroll(
    () => {
      return isClient ? document.scrollingElement : null;
    },
    async ([, , isScrolling]) => {
      console.log('scrolling bottom', isScrolling);
      if (isFetchingPreviousPage || !hasPreviousPage) {
        return;
      }

      if (!isScrolling) {
        return;
      }

      const scrollingElement = globalThis.document.scrollingElement;

      if (!scrollingElement) {
        return;
      }

      const scrollTop = scrollingElement.scrollTop;
      const scrollHeightBefore = scrollingElement.scrollHeight;

      try {
        await fetchPreviousPage();
        scrollingElement.scrollTop = scrollingElement.scrollHeight - scrollHeightBefore + scrollTop;
      } catch {
        await new Promise((resolve) => {
          return setTimeout(resolve, 1000);
        });
      }
    },
    {
      distance: isClient ? globalThis.innerHeight / 2 : 0,
      direction: 'top',
    },
  );

  useEffect(() => {
    if (!selectedPostId) {
      return;
    }

    const targetPostElement = globalThis.document.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(selectedPostId)}"]`,
    );

    if (!targetPostElement) {
      return;
    }

    targetPostElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [selectedPostId]);

  return (
    <DeletePostProvider>
      <EditPostProvider>
        <MessageScroller.Provider defaultScrollPosition="start">
          <MessageScroller.Root className="relative">
            <MessageScroller.Viewport>
              <MessageScroller.Content className="mb-6 flex flex-col gap-6">
                {isFetchingPreviousPage && (
                  <MessageScroller.Item className="flex justify-center">
                    <Spinner />
                  </MessageScroller.Item>
                )}

                {posts.map((post) => {
                  return (
                    <MessageScroller.Item
                      key={post._meta.id}
                      messageId={post._meta.id}
                      scrollAnchor={selectedPostId === post._meta.id}
                    >
                      <Post {...{ post, selectedPostId }} />
                    </MessageScroller.Item>
                  );
                })}

                {isFetchingNextPage && (
                  <MessageScroller.Item className="flex justify-center">
                    <Spinner />
                  </MessageScroller.Item>
                )}

                {!hasNextPage && posts.length > 0 && (
                  <MessageScroller.Item>
                    <Marker variant="separator" className="text-xs">
                      <MarkerContent>{t('thereAreNoMorePosts')}</MarkerContent>
                    </Marker>
                  </MessageScroller.Item>
                )}
              </MessageScroller.Content>
            </MessageScroller.Viewport>
          </MessageScroller.Root>
        </MessageScroller.Provider>

        {isAdmin && <DialogDeletePost />}
      </EditPostProvider>
    </DeletePostProvider>
  );
};

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
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { useWindowScroll } from 'react-use';

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
  const { y } = useWindowScroll();
  const { isAdmin } = useIsAdminContext();
  const scrolledToPostIdRef = useRef<components['schemas']['PostResponse']['_meta']['id'] | null>(null);
  const previousWindowYRef = useRef<number | null>(null);

  const infiniteQueryGetPosts = useInfiniteQueryGetPosts(selectedPostId);

  const posts = useMemo(() => {
    return (
      infiniteQueryGetPosts.data?.pages.flatMap((page) => {
        return page.rows;
      }) ?? []
    );
  }, [infiniteQueryGetPosts.data?.pages]);

  useEffect(() => {
    scrolledToPostIdRef.current = null;
  }, [selectedPostId]);

  useEffect(() => {
    if (!selectedPostId) {
      return;
    }

    if (scrolledToPostIdRef.current === selectedPostId) {
      return;
    }

    const targetPostElement = globalThis.document.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(selectedPostId)}"]`,
    );

    if (!targetPostElement) {
      return;
    }

    globalThis.requestAnimationFrame(() => {
      targetPostElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });

    scrolledToPostIdRef.current = selectedPostId;
  }, [posts, selectedPostId]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const previousWindowY = previousWindowYRef.current;
    previousWindowYRef.current = y;

    if (previousWindowY === null) {
      return;
    }

    const scrollDelta = y - previousWindowY;

    if (scrollDelta === 0) {
      return;
    }

    const scrollTop = y;
    const viewportHeight = globalThis.innerHeight;
    const edgeThreshold = viewportHeight;
    const fullHeight = document.documentElement.scrollHeight;

    if (
      scrollDelta < 0 &&
      scrollTop <= edgeThreshold &&
      infiniteQueryGetPosts.hasPreviousPage &&
      !infiniteQueryGetPosts.isFetchingPreviousPage
    ) {
      infiniteQueryGetPosts.fetchPreviousPage();
      return;
    }

    const distanceToBottom = fullHeight - (scrollTop + viewportHeight);

    if (
      scrollDelta > 0 &&
      distanceToBottom <= edgeThreshold &&
      infiniteQueryGetPosts.hasNextPage &&
      !infiniteQueryGetPosts.isFetchingNextPage
    ) {
      infiniteQueryGetPosts.fetchNextPage();
    }
  }, [
    y,
    infiniteQueryGetPosts,
    infiniteQueryGetPosts.hasNextPage,
    infiniteQueryGetPosts.hasPreviousPage,
    infiniteQueryGetPosts.isFetchingNextPage,
    infiniteQueryGetPosts.isFetchingPreviousPage,
  ]);

  return (
    <DeletePostProvider>
      <EditPostProvider>
        <MessageScroller.Provider defaultScrollPosition="start">
          <MessageScroller.Root className="relative">
            <MessageScroller.Viewport>
              <MessageScroller.Content className="mb-6 flex flex-col gap-6">
                {infiniteQueryGetPosts.isFetchingPreviousPage && (
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

                {infiniteQueryGetPosts.isFetchingNextPage && (
                  <MessageScroller.Item className="flex justify-center">
                    <Spinner />
                  </MessageScroller.Item>
                )}

                {!infiniteQueryGetPosts.hasNextPage && posts.length > 0 && (
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

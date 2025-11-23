import { computed, inject, provide } from 'vue';
import type { InjectionKey } from 'vue';

import {
  getPosts as _getPosts,
  postPost as _postPost,
  deletePost as _deletePost,
  putPost as _putPost,
  getPostById as _getPostById,
} from '@/api/posts';
import type { PostWithMetaWithSinseTimestamps } from '@/api/posts';
import { postUpload } from '@/api/upload';
import type { ForPost, ForPut } from '@etonee123x/shared/types/database';
import type { Post } from '@etonee123x/shared/types/blog';
import { toId } from '@etonee123x/shared/helpers/id';
import type { Id } from '@etonee123x/shared/helpers/id';
import { nonNullable } from '@/utils/nonNullable';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/vue-query';
import type {
  InfiniteData,
  UseInfiniteQueryReturnType,
  UseMutationReturnType,
  UseQueryReturnType,
} from '@tanstack/vue-query';
import { useRoute } from 'vue-router';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { useGoToPage404 } from '@/composables/useGoToPage404';

interface BlogContext {
  getPostsQuery: UseInfiniteQueryReturnType<InfiniteData<Awaited<ReturnType<typeof _getPosts>>>, Error>;
  postPostMutation: UseMutationReturnType<
    PostWithMetaWithSinseTimestamps,
    Error,
    {
      postData: ForPost<Post>;
      files?: Array<File>;
    },
    unknown
  >;
  putPostByIdMutation: UseMutationReturnType<
    PostWithMetaWithSinseTimestamps,
    Error,
    {
      id: Id;
      postData: ForPut<Post>;
      files?: Array<File>;
    },
    unknown
  >;
  getPostByIdQuery: UseQueryReturnType<PostWithMetaWithSinseTimestamps, Error>;
  deletePostByIdMutation: UseMutationReturnType<PostWithMetaWithSinseTimestamps, Error, Id, unknown>;
}

export const INJECTION_KEY_BLOG: InjectionKey<BlogContext> = Symbol('blog');

export const provideBlogContext = () => {
  const route = useRoute();
  const postId = computed(() => (isNil(route.params.postId) ? null : toId(String(route.params.postId))));

  const goToPage404 = useGoToPage404();

  const getPostsQuery: BlogContext['getPostsQuery'] = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam: pageParameter = 0 }) => _getPosts(pageParameter),
    getNextPageParam: (lastPage) => (lastPage._meta.isEnd ? undefined : lastPage._meta.page + 1),
    initialPageParam: 0,
  });

  const postPostMutation: BlogContext['postPostMutation'] = useMutation({
    mutationKey: ['post'],
    mutationFn: async (payload) => {
      const payloadFiles = payload.files ?? [];

      const filesUrls = payloadFiles.length > 0 ? await postUpload(payloadFiles) : [];

      return _postPost({ ...payload.postData, filesUrls });
    },
  });

  const putPostByIdMutation: BlogContext['putPostByIdMutation'] = useMutation({
    mutationKey: ['post'],
    mutationFn: async (payload) => {
      const payloadFiles = payload.files ?? [];

      const filesUrls = payloadFiles.length > 0 ? await postUpload(payloadFiles) : [];

      return _putPost(payload.id, { ...payload.postData, filesUrls });
    },
  });

  const getPostByIdQuery: BlogContext['getPostByIdQuery'] = useQuery({
    queryKey: ['post', postId],
    queryFn: () => _getPostById(nonNullable(postId.value)).catch(() => goToPage404()),
    enabled: () => isNotNil(postId.value),
    placeholderData: undefined,
  });

  const deletePostByIdMutation: BlogContext['deletePostByIdMutation'] = useMutation({
    mutationKey: ['post'],
    mutationFn: (...parameters: Parameters<typeof _deletePost>) => _deletePost(...parameters),
  });

  const blogContext = {
    getPostsQuery,
    getPostByIdQuery,
    postPostMutation,
    putPostByIdMutation,
    deletePostByIdMutation,
  };

  provide(INJECTION_KEY_BLOG, blogContext);

  return blogContext;
};

export const useBlogContext = () => nonNullable(inject(INJECTION_KEY_BLOG));

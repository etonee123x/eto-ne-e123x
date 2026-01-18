import { computed, inject, provide } from 'vue';
import type { InjectionKey, UnwrapRef } from 'vue';

import { nonNullable } from '@/utils/nonNullable';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type {
  InfiniteData,
  UseInfiniteQueryReturnType,
  UseMutationReturnType,
  UseQueryReturnType,
} from '@tanstack/vue-query';
import { useRoute } from 'vue-router';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { ROUTE_NAMES } from '@/router';
import { awaitSuspensesIfNecessary } from '@/helpers/awaitSuspensesIfNecessary';
import { client } from '@/api/client';
import { useClientRequestPromiseWrapper } from '@/composables/useClientRequestPromiseWrapper';

const PAGE_SIZE = 10;

const MODULE_NAME = 'posts';

interface BlogContext {
  getPostsQuery: UseInfiniteQueryReturnType<
    InfiniteData<NonNullable<Awaited<ReturnType<(typeof client)['/posts']['GET']>>['data']>>,
    Error
  >;
  postPostMutation: UseMutationReturnType<
    NonNullable<Awaited<ReturnType<(typeof client)['/posts']['POST']>>['data']>,
    Error,
    Parameters<(typeof client)['/posts']['POST']>[0],
    unknown
  >;
  patchPostByIdMutation: UseMutationReturnType<
    NonNullable<Awaited<ReturnType<(typeof client)['/posts/{id}']['PATCH']>>['data']>,
    Error,
    Parameters<(typeof client)['/posts/{id}']['PATCH']>[0],
    unknown
  >;
  getPostByIdQuery: UseQueryReturnType<
    NonNullable<Awaited<ReturnType<(typeof client)['/posts/{id}']['GET']>>['data']>,
    Error
  >;
  deletePostByIdMutation: UseMutationReturnType<
    NonNullable<Awaited<ReturnType<(typeof client)['/posts/{id}']['DELETE']>>['data']>,
    Error,
    Parameters<(typeof client)['/posts/{id}']['DELETE']>[0],
    unknown
  >;
}

export const INJECTION_KEY_BLOG: InjectionKey<BlogContext> = Symbol('blog');

export const provideBlogContext = async () => {
  const clientRequestPromiseWrapper = useClientRequestPromiseWrapper();

  const route = useRoute();
  const postId = computed(() => {
    return isNil(route.params.postId) ? null : String(route.params.postId);
  });

  const queryClient = useQueryClient();

  const getPostsQuery: BlogContext['getPostsQuery'] = useInfiniteQuery({
    queryKey: [MODULE_NAME],
    queryFn: (
      ...parameters
    ): Promise<NonNullable<UnwrapRef<BlogContext['getPostsQuery']['data']>>['pages'][number]> => {
      return clientRequestPromiseWrapper(
        client['/posts'].GET({
          params: {
            query: {
              page: parameters[0].pageParam,
              pageSize: PAGE_SIZE,
            },
          },
        }),
      );
    },
    getNextPageParam: (lastPage) => {
      return lastPage._meta.isEnd ? undefined : lastPage._meta.page + 1;
    },
    initialPageParam: 0,
    enabled: () => {
      return route.name === ROUTE_NAMES.BLOG || route.name === ROUTE_NAMES.BLOG_POST;
    },
  });

  const getPostByIdQuery: BlogContext['getPostByIdQuery'] = useQuery({
    queryKey: [MODULE_NAME, postId],
    queryFn: (): Promise<NonNullable<UnwrapRef<BlogContext['getPostByIdQuery']['data']>>> => {
      return clientRequestPromiseWrapper(
        client['/posts/{id}'].GET({
          params: {
            path: {
              id: nonNullable(postId.value),
            },
          },
        }),
      );
    },
    enabled: () => {
      return route.name === ROUTE_NAMES.BLOG_POST;
    },
    placeholderData: undefined,
  });

  const postPostMutation: BlogContext['postPostMutation'] = useMutation({
    mutationKey: [MODULE_NAME],
    mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<BlogContext['postPostMutation']['data']>>> => {
      return clientRequestPromiseWrapper(client['/posts'].POST(parameters[0]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODULE_NAME] });
    },
  });

  const patchPostByIdMutation: BlogContext['patchPostByIdMutation'] = useMutation({
    mutationKey: [MODULE_NAME],
    mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<BlogContext['patchPostByIdMutation']['data']>>> => {
      return clientRequestPromiseWrapper(client['/posts/{id}'].PATCH(parameters[0]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODULE_NAME] });
    },
  });

  const deletePostByIdMutation: BlogContext['deletePostByIdMutation'] = useMutation({
    mutationKey: [MODULE_NAME],
    mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<BlogContext['deletePostByIdMutation']['data']>>> => {
      return clientRequestPromiseWrapper(client['/posts/{id}'].DELETE(parameters[0]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODULE_NAME] });
    },
  });

  const blogContext = {
    getPostsQuery,
    getPostByIdQuery,
    postPostMutation,
    patchPostByIdMutation,
    deletePostByIdMutation,
  };

  provide(INJECTION_KEY_BLOG, blogContext);

  await awaitSuspensesIfNecessary([
    [getPostsQuery.isEnabled.value, getPostsQuery.suspense],
    [getPostByIdQuery.isEnabled.value, getPostByIdQuery.suspense],
  ]);

  return blogContext;
};

export const useBlogContext = () => {
  return nonNullable(inject(INJECTION_KEY_BLOG));
};

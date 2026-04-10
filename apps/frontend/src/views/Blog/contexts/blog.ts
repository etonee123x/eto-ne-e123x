import { computed, inject, provide, reactive } from 'vue';
import type { InjectionKey, Reactive, UnwrapRef } from 'vue';

import { nonNullable } from '@/utils/nonNullable';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { InfiniteData, UseInfiniteQueryReturnType, UseMutationReturnType } from '@tanstack/vue-query';
import { useRoute } from 'vue-router';
import { ROUTE_NAMES } from '@/plugins/router';
import { awaitSuspensesIfNecessary } from '@/helpers/awaitSuspensesIfNecessary';
import { client } from '@/api/client';
import { useClientRequestPromiseWrapper } from '@/composables/useClientRequestPromiseWrapper';

const PAGE_SIZE = 20;

interface BlogContext {
  getPostsQuery: Reactive<
    UseInfiniteQueryReturnType<
      InfiniteData<NonNullable<Awaited<ReturnType<(typeof client)['/posts']['GET']>>['data']>>,
      Error
    >
  >;
  postPostMutation: Reactive<
    UseMutationReturnType<
      NonNullable<Awaited<ReturnType<(typeof client)['/posts']['POST']>>['data']>,
      Error,
      Parameters<(typeof client)['/posts']['POST']>[0],
      unknown
    >
  >;
  patchPostByIdMutation: Reactive<
    UseMutationReturnType<
      NonNullable<Awaited<ReturnType<(typeof client)['/posts/{id}']['PATCH']>>['data']>,
      Error,
      Parameters<(typeof client)['/posts/{id}']['PATCH']>[0],
      unknown
    >
  >;
  deletePostByIdMutation: Reactive<
    UseMutationReturnType<
      NonNullable<Awaited<ReturnType<(typeof client)['/posts/{id}']['DELETE']>>['data']>,
      Error,
      Parameters<(typeof client)['/posts/{id}']['DELETE']>[0],
      unknown
    >
  >;
}

export const INJECTION_KEY_BLOG: InjectionKey<BlogContext> = Symbol('blog');

export const provideBlogContext = async () => {
  const clientRequestPromiseWrapper = useClientRequestPromiseWrapper();

  const route = useRoute();

  const queryClient = useQueryClient();

  const getPostsQuery: BlogContext['getPostsQuery'] = reactive(
    useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: (
        ...parameters
      ): Promise<NonNullable<UnwrapRef<BlogContext['getPostsQuery']['data']>>['pages'][number]> => {
        return clientRequestPromiseWrapper(
          client['/posts'].GET({
            params: {
              query: {
                ...parameters[0].pageParam,
                pageSize: PAGE_SIZE,
              },
            },
          }),
        );
      },
      getPreviousPageParam: (
        firstPage,
      ): NonNullable<NonNullable<Parameters<(typeof client)['/posts']['GET']>[0]>['params']>['query'] => {
        return firstPage._meta.cursorPrevious
          ? {
              filters: {
                cursorPrevious: firstPage._meta.cursorPrevious,
              },
            }
          : undefined;
      },
      getNextPageParam: (
        lastPage,
      ): NonNullable<NonNullable<Parameters<(typeof client)['/posts']['GET']>[0]>['params']>['query'] => {
        return lastPage._meta.cursorNext
          ? {
              filters: {
                cursorNext: lastPage._meta.cursorNext,
              },
            }
          : undefined;
      },
      initialPageParam: computed(
        (): NonNullable<NonNullable<Parameters<(typeof client)['/posts']['GET']>[0]>['params']>['query'] => {
          return route.params.postId
            ? {
                filters: {
                  postId: String(route.params.postId),
                },
              }
            : {};
        },
      ),
      enabled: () => {
        return route.name === ROUTE_NAMES.BLOG || route.name === ROUTE_NAMES.BLOG_POST;
      },
    }),
  );

  const postPostMutation: BlogContext['postPostMutation'] = reactive(
    useMutation({
      mutationKey: ['posts'],
      mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<BlogContext['postPostMutation']['data']>>> => {
        return clientRequestPromiseWrapper(client['/posts'].POST(parameters[0]));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }),
  );

  const patchPostByIdMutation: BlogContext['patchPostByIdMutation'] = reactive(
    useMutation({
      mutationKey: ['posts'],
      mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<BlogContext['patchPostByIdMutation']['data']>>> => {
        return clientRequestPromiseWrapper(client['/posts/{id}'].PATCH(parameters[0]));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }),
  );

  const deletePostByIdMutation: BlogContext['deletePostByIdMutation'] = reactive(
    useMutation({
      mutationKey: ['posts'],
      mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<BlogContext['deletePostByIdMutation']['data']>>> => {
        return clientRequestPromiseWrapper(client['/posts/{id}'].DELETE(parameters[0]));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }),
  );

  const blogContext = {
    getPostsQuery,
    postPostMutation,
    patchPostByIdMutation,
    deletePostByIdMutation,
  };

  provide(INJECTION_KEY_BLOG, blogContext);

  await awaitSuspensesIfNecessary([[getPostsQuery.isEnabled, getPostsQuery.suspense]]);

  return blogContext;
};

export const useBlogContext = () => {
  return nonNullable(inject(INJECTION_KEY_BLOG));
};

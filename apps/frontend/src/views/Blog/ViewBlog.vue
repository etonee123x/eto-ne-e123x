<template>
  <BasePage :h1="t('blog')" ref="basePage">
    <template v-if="authContext.isAdmin.value">
      <LazyBlogEditPost ref="lazyBlogEditPost" @submit="onSubmit">
        <BaseButton type="submit" :isLoading="blogContext.postPostMutation.isPending.value">
          {{ t('send') }}
        </BaseButton>
      </LazyBlogEditPost>
      <hr v-if="hasPosts" class="my-4" />
    </template>

    <template v-if="hasPosts">
      <BlogPost
        v-for="post in posts"
        class="not-last:mb-4"
        :post
        :onBeforeDelete
        :isInEditMode="areIdsEqual(editModeFor, post._meta.id)"
        :key="post._meta.id"
        @changeEditModeFor="onChangeEditModeFor"
      />
    </template>
    <div
      v-else-if="!blogContext.getPostsQuery.isFetching.value"
      class="text-lg flex justify-center items-center flex-1 h-full"
    >
      {{ t('nothingWasFound') }}
    </div>
    <LazyBaseLoading v-if="blogContext.getPostsQuery.isFetching.value" isFull class="flex justify-center" />

    <DialogConfirmation
      :title="t('confirmDelete')"
      :message="t('deleteMessage')"
      ref="dialogConfirmationDelete"
      @confirm="confirm"
      @cancel="cancel"
      @close="cancel"
    />

    <DialogPost />
  </BasePage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useConfirmDialog, useInfiniteScroll } from '@vueuse/core';
import { defineAsyncComponent, computed, useTemplateRef, onServerPrefetch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { areIdsEqual } from '@etonee123x/shared/helpers/id';
import type { Id } from '@etonee123x/shared/helpers/id';

import DialogPost from './components/DialogPost.vue';
import BlogPost from './components/BlogPost.vue';

import DialogConfirmation from '@/components/DialogConfirmation.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { isClient } from '@/constants/target';
import { clientOnly } from '@/helpers/clientOnly';
import BaseButton from '@/components/ui/BaseButton';
import BasePage from '@/components/ui/BasePage.vue';
import { useSeoMeta } from '@unhead/vue';
import { useAuthContext } from '@/contexts/auth';
import { provideBlogContext } from './contexts/blog';

const LazyBaseLoading = defineAsyncComponent(() => import('@/components/ui/BaseLoading.vue'));

const LazyBlogEditPost = defineAsyncComponent(() => import('./components/BlogEditPost.vue'));

const dialogConfirmationDelete = useTemplateRef('dialogConfirmationDelete');
const lazyBlogEditPost = useTemplateRef('lazyBlogEditPost');

const basePage = useTemplateRef('basePage');

const { reveal, confirm, cancel } = useConfirmDialog();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      blog: 'Блог',
      send: 'Отправить',
      nothingWasFound: 'Ничего не найдено...',
      confirmDelete: 'Удалить пост',
      deleteMessage: 'Вы уверены, что хотите удалить этот пост?',
      microblogWithNoClearDirection:
        'Микроблог без чёткой направленности. Что-то из мыслей, что-то случайное. Всё складывается в одну ленту',
      myBlog: 'Мой блог. Пост.',
    },
    en: {
      blog: 'Blog',
      send: 'Send',
      nothingWasFound: 'Nothing was found...',
      confirmDelete: 'Delete Post',
      deleteMessage: 'Are you sure you want to delete this post?',
      microblogWithNoClearDirection:
        'Microblog with no clear direction. Something from thoughts, something random. Everything is combined into one feed.',
      myBlog: 'My blog. Post.',
    },
  },
});

const editModeFor = ref<Id | null>(null);

const route = useRoute();

const blogContext = provideBlogContext();

const authContext = useAuthContext();

const posts = computed(() => blogContext.getPostsQuery.data.value?.pages.flatMap((page) => page.rows) ?? []);

const hasPosts = computed(() => posts.value.length > 0);

useInfiniteScroll(
  () => (isClient ? (globalThis as unknown as Window) : null),
  () =>
    blogContext.getPostsQuery
      .fetchNextPage()
      .then(() => undefined)
      // чтобы не спамить запросами при ошибке (когда нет интернета)
      .catch(() => new Promise((resolve) => setTimeout(resolve, 1000))),
  {
    canLoadMore: () => !blogContext.getPostsQuery.isFetching.value && blogContext.getPostsQuery.hasNextPage.value,
    distance: 100,
  },
);

const onSubmit: InstanceType<typeof LazyBlogEditPost>['onSubmit'] = async (postData, files) =>
  blogContext.postPostMutation.mutateAsync({ postData, files });

const onBeforeDelete = async () => {
  dialogConfirmationDelete.value?.open();

  const { isCanceled } = await reveal();

  return !isCanceled;
};

const onChangeEditModeFor: NonNullable<InstanceType<typeof BlogPost>['onChangeEditModeFor']> = (id) => {
  editModeFor.value = id;
};

const fetchData = () =>
  Promise.all([
    blogContext.getPostsQuery.suspense(),
    ...(isNotNil(route.params.postId)
      ? [
          //
          blogContext.getPostByIdQuery.suspense(),
        ]
      : []),
  ]);

onServerPrefetch(fetchData);
clientOnly(fetchData);

useSeoMeta({
  description: () => (blogContext.getPostByIdQuery.data.value ? t('myBlog') : t('microblogWithNoClearDirection')),
});
</script>

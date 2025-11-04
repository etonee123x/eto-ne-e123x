<template>
  <BasePage :h1="t('blog')">
    <template v-if="authContext.isAdmin.value">
      <LazyBlogEditPost ref="lazyBlogEditPost" @submit="onSubmit">
        <BaseButton type="submit" :isLoading="blogContext.postPost.isLoading.value">
          {{ t('send') }}
        </BaseButton>
      </LazyBlogEditPost>
      <hr v-if="hasPosts" class="my-4" />
    </template>

    <template v-if="hasPosts">
      <BlogPost
        v-for="post in blogContext.getPosts.state.value"
        class="not-last:mb-4"
        :post
        :onBeforeDelete
        :isInEditMode="areIdsEqual(editModeFor, post._meta.id)"
        :key="post._meta.id"
        @changeEditModeFor="onChangeEditModeFor"
      />
    </template>
    <div
      v-else-if="!blogContext.getPosts.isLoading.value"
      class="text-lg flex justify-center items-center flex-1 h-full"
    >
      {{ t('nothingWasFound') }}
    </div>
    <LazyBaseLoading v-if="blogContext.getPosts.isLoading.value" isFull class="flex justify-center" />

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
import { defineAsyncComponent, computed, useTemplateRef, watch, onServerPrefetch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { areIdsEqual, toId, type Id } from '@etonee123x/shared/helpers/id';

import DialogPost from './components/DialogPost.vue';
import BlogPost from './components/BlogPost.vue';

import { useGoToPage404 } from '@/composables/useGoToPage404';
import DialogConfirmation from '@/components/DialogConfirmation.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { isClient, isServer } from '@/constants/target';
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

const hasPosts = computed(() => blogContext.getPosts.state.value.length > 0);

const goToPage404 = useGoToPage404();

useInfiniteScroll(
  isClient ? document.body : null,
  () =>
    blogContext.getPosts
      .execute()
      .then(() => undefined)
      // чтобы не спамить запросами при ошибке (когда нет интернета)
      .catch(() => new Promise((resolve) => setTimeout(resolve, 1000))),
  {
    canLoadMore: () => !(blogContext.getPosts.isLoading.value || blogContext.isEnd.value),
    distance: 100,
  },
);

const onSubmit: InstanceType<typeof LazyBlogEditPost>['onSubmit'] = async (postData, files) =>
  blogContext.postPost.execute(postData, files).then(() => blogContext.getPosts.execute({ shouldReset: true }));

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
    blogContext.getPosts.execute(),
    ...(isNotNil(route.params.postId)
      ? [
          //
          blogContext.getPostById.execute(toId(String(route.params.postId))).catch(goToPage404),
        ]
      : []),
  ]);

if (!isServer) {
  watch(
    () => route.params.postId,
    async () => {
      if (isNotNil(route.params.postId)) {
        await blogContext.getPostById.execute(toId(String(route.params.postId)));

        return;
      }

      blogContext.getPostById.state.value = undefined;
    },
  );
}

onServerPrefetch(fetchData);
clientOnly(fetchData);

useSeoMeta({
  description: () => (blogContext.getPostById.state.value ? t('myBlog') : t('microblogWithNoClearDirection')),
});
</script>

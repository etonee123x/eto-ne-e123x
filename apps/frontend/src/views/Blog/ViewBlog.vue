<template>
  <BasePage :h1="t('blog')">
    <template v-if="auth.isAdmin.value">
      <LazyBaseForm class="flex flex-col gap-4" ref="baseForm" @submit.prevent="onSubmit">
        <LazyBlogEditPost
          :v$
          ref="lazyBlogEditPost"
          v-model="postData"
          v-model:files="files"
          @keydown:enter="onKeyDownEnter"
        />
        <BaseButton type="submit" :isLoading="blogStore.postPost.isLoading">
          {{ t('send') }}
        </BaseButton>
      </LazyBaseForm>
      <hr v-if="hasPosts" class="my-4" />
    </template>

    <template v-if="hasPosts">
      <BlogPost
        v-for="post in blogStore.getPosts.state"
        class="not-last:mb-4"
        :post
        :onBeforeDelete
        :isInEditMode="areIdsEqual(editModeFor, post._meta.id)"
        :key="post._meta.id"
        @changeEditModeFor="onChangeEditModeFor"
      />
    </template>
    <div v-else-if="!blogStore.getPosts.isLoading" class="text-lg flex justify-center items-center flex-1 h-full">
      {{ t('nothingWasFound') }}
    </div>
    <LazyBaseLoading v-if="blogStore.getPosts.isLoading" isFull class="flex justify-center" />

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

import { useBlogStore } from '@/stores/blog';
import { useVuelidatePostData } from './composables/useVuelidatePostData';
import { useGoToPage404 } from '@/composables/useGoToPage404';
import DialogConfirmation from '@/components/DialogConfirmation.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { isClient, isServer } from '@/constants/target';
import { clientOnly } from '@/helpers/clientOnly';
import BaseButton from '@/components/ui/BaseButton';
import { useSourcedRef } from '@/composables/useSourcedRef';
import type { Post } from '@etonee123x/shared/types/blog';
import type { ForPost } from '@etonee123x/shared/types/database';
import BasePage from '@/components/ui/BasePage.vue';
import { useSeoMeta } from '@unhead/vue';
import { useOnPostTextareaKeyDownEnter } from './composables/useOnPostTextareaKeyDownEnter';
import { useAuth } from '@/plugins/auth';

const LazyBaseForm = defineAsyncComponent(() => import('@/components/ui/BaseForm.vue'));
const LazyBaseLoading = defineAsyncComponent(() => import('@/components/ui/BaseLoading.vue'));

const LazyBlogEditPost = defineAsyncComponent(() => import('./components/BlogEditPost.vue'));

const dialogConfirmationDelete = useTemplateRef('dialogConfirmationDelete');
const baseForm = useTemplateRef('baseForm');
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

const blogStore = useBlogStore();

const auth = useAuth();

const hasPosts = computed(() => Boolean(blogStore.getPosts.state.length));

const goToPage404 = useGoToPage404();

useInfiniteScroll(
  isClient ? document.body : null,
  () =>
    blogStore.getPosts
      .execute()
      .then(() => undefined)
      // чтобы не спамить запросами при ошибке (когда нет интернета)
      .catch(() => new Promise((resolve) => setTimeout(resolve, 1000))),
  {
    canLoadMore: () => !(blogStore.getPosts.isLoading || blogStore.isEnd),
    distance: 100,
  },
);

const [files, resetFiles] = useSourcedRef<Array<File>>([]);

const [postData, resetPostModel] = useSourcedRef<ForPost<Post>>(() => ({
  text: '',
  filesUrls: [],
}));

const { v$ } = useVuelidatePostData(postData, files);

const onSubmit = async () => {
  if (!(await v$.value.$validate())) {
    return;
  }

  blogStore.postPost.execute(postData.value, files.value).then(() => blogStore.getPosts.execute({ shouldReset: true }));

  v$.value.$reset();
  resetFiles();
  resetPostModel();

  lazyBlogEditPost.value?.focusTextarea();
};

const onKeyDownEnter = useOnPostTextareaKeyDownEnter(() => baseForm.value?.requestSubmit());

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
    blogStore.getPosts.execute(),
    ...(isNotNil(route.params.postId)
      ? [
          //
          blogStore.getPostById.execute(toId(String(route.params.postId))).catch(goToPage404),
        ]
      : []),
  ]);

onServerPrefetch(fetchData);
clientOnly(fetchData);

if (!isServer) {
  watch(
    () => route.params.postId,
    async () => {
      if (isNotNil(route.params.postId)) {
        await blogStore.getPostById.execute(toId(String(route.params.postId)));

        return;
      }

      blogStore.getPostById.state = undefined;
    },
  );
}

useSeoMeta({
  description: () => (blogStore.getPostById.state ? t('myBlog') : t('microblogWithNoClearDirection')),
});
</script>

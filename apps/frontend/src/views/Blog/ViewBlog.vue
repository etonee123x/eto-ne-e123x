<template>
  <BasePage :h1="t('blog')" ref="basePage">
    <template v-if="authContext.isAdmin.value">
      <LazyBlogEditPost ref="lazyBlogEditPost" @submit="onSubmit">
        <BaseButton type="submit" :isLoading="blogContext.postPostMutation.isPending.value">
          {{ t('send') }}
        </BaseButton>
      </LazyBlogEditPost>
      <hr class="my-4" />
    </template>

    <template v-if="hasPosts">
      <BlogPost
        v-for="post in posts"
        class="not-last:mb-4"
        :post
        :onBeforeDelete
        :isInEditMode="editModeFor === post._meta.id"
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
import { defineAsyncComponent, computed, useTemplateRef, ref } from 'vue';

import DialogPost from './components/DialogPost.vue';
import BlogPost from './components/BlogPost.vue';

import DialogConfirmation from '@/components/DialogConfirmation.vue';
import { isClient } from '@/constants/target';
import BaseButton from '@/components/ui/BaseButton';
import BasePage from '@/components/ui/BasePage.vue';
import { useSeoMeta } from '@unhead/vue';
import { useAuthContext } from '@/contexts/auth';
import { useBlogContext } from './contexts/blog';

const LazyBaseLoading = defineAsyncComponent(() => {
  return import('@/components/ui/BaseLoading.vue');
});

const LazyBlogEditPost = defineAsyncComponent(() => {
  return import('./components/BlogEditPost.vue');
});

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

const editModeFor = ref<string | null>(null);

const blogContext = useBlogContext();

const authContext = useAuthContext();

const posts = computed(() => {
  return (
    blogContext.getPostsQuery.data.value?.pages.flatMap((page) => {
      return page.rows;
    }) ?? []
  );
});

const hasPosts = computed(() => {
  return posts.value.length > 0;
});

useInfiniteScroll(
  () => {
    return isClient ? (globalThis as unknown as Window) : null;
  },
  () => {
    return (
      blogContext.getPostsQuery
        .fetchNextPage()
        .then(() => {
          return undefined;
        })
        // чтобы не спамить запросами при ошибке (когда нет интернета)
        .catch(() => {
          return new Promise((resolve) => {
            return setTimeout(resolve, 1000);
          });
        })
    );
  },
  {
    canLoadMore: () => {
      return !blogContext.getPostsQuery.isFetching.value && blogContext.getPostsQuery.hasNextPage.value;
    },
    distance: 100,
  },
);

const onSubmit: InstanceType<typeof LazyBlogEditPost>['onSubmit'] = async (postCreateRequestData, files) => {
  return blogContext.postPostMutation.mutateAsync({
    body: {
      files: [],
      text: postCreateRequestData.text,
    },
    bodySerializer: (body) => {
      const formData = new FormData();

      formData.append('text', body.text);

      files.forEach((file) => {
        formData.append('files', file);
      });

      return formData;
    },
  });
};

const onBeforeDelete = async () => {
  dialogConfirmationDelete.value?.open();

  const { isCanceled } = await reveal();

  return !isCanceled;
};

const onChangeEditModeFor: NonNullable<InstanceType<typeof BlogPost>['onChangeEditModeFor']> = (id) => {
  editModeFor.value = id;
};

useSeoMeta({
  description: () => {
    return blogContext.getPostByIdQuery.data.value ? t('myBlog') : t('microblogWithNoClearDirection');
  },
});
</script>

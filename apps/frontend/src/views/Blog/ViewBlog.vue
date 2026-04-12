<template>
  <BasePage :h1="t('blog')">
    <LazyFormPost
      v-if="authContext.isAdmin.value"
      :post="{ text: '', attachments: [] }"
      class="mb-8 relative after:w-full after:h-px after:bg-neutral-700 after:absolute after:top-full after:mt-4"
      ref="formPost"
      @submit="onSubmit"
    >
      <BaseButton v-if="formPost?.isValid" type="submit" :isLoading="blogContext.postPostMutation.isPending">
        {{ t('send') }}
      </BaseButton>
    </LazyFormPost>

    <div class="flex flex-col gap-4">
      <BaseButton
        v-if="shouldRenderButtonUp"
        class="fixed z-10 inset-x-0 top-header-height"
        :propsIconPrepend="{ path: mdiArrowUp }"
        @click="onClickButtonUp"
      >
        {{ t('toTheBeginning') }}
      </BaseButton>

      <LazyBaseLoading v-if="blogContext.getPostsQuery.isFetchingPreviousPage" isFull class="flex justify-center" />

      <template v-if="hasPosts">
        <BlogPost
          v-for="post in posts"
          :post
          :onBeforeDelete
          :isInEditMode="editModeFor === post._meta.id"
          :data-id="post._meta.id"
          :key="post._meta.id"
          @changeEditModeFor="onChangeEditModeFor"
        />
      </template>
      <div
        v-else-if="!blogContext.getPostsQuery.isFetching"
        class="text-lg flex justify-center items-center flex-1 h-full"
      >
        {{ t('nothingWasFound') }}
      </div>

      <LazyBaseLoading v-if="blogContext.getPostsQuery.isFetchingNextPage" isFull class="flex justify-center" />
    </div>

    <LazyDialogConfirmation
      v-if="authContext.isAdmin.value"
      :title="t('confirmDelete')"
      :message="t('deleteMessage')"
      ref="dialogConfirmationDelete"
      @confirm="confirm"
      @cancel="cancel"
      @close="cancel"
    />

    <LazyDialogGallery
      v-if="galleryItemContext.value"
      :item="galleryItemContext.value"
      :items="
        blogContext.getPostsQuery.data?.pages
          .flatMap(propertyCurried('rows'))
          .flatMap(propertyCurried('attachments'))
          .filter((attachment) => {
            return isFolderDataGalleryItem(attachment);
          }) ?? []
      "
      :onClose="onCloseGallery"
    />
  </BasePage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useConfirmDialog, useInfiniteScroll, useWindowScroll } from '@vueuse/core';
import { defineAsyncComponent, computed, useTemplateRef, ref, onMounted, reactive } from 'vue';

import BlogPost from './components/BlogPost.vue';

import { isClient } from '@/constants/target';
import BaseButton from '@/components/ui/BaseButton.vue';
import BasePage from '@/components/ui/BasePage.vue';
import { useSeoMeta } from '@unhead/vue';
import { useAuthContext } from '@/contexts/auth';
import { provideBlogContext } from './contexts/blog';
import { useRoute, useRouter } from 'vue-router';
import { mdiArrowUp } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { ROUTE_NAMES } from '@/plugins/router';
import { FILE_TYPES, isFolderDataGalleryItem } from '@/helpers/folderData';
import { propertyCurried } from '@etonee123x/shared/utils/property';
import { provideGalleryItemContext } from './contexts/galleryItem';

const galleryItemContext = provideGalleryItemContext();

const onCloseGallery = () => {
  galleryItemContext.reset();
};

const LazyDialogGallery = defineAsyncComponent(() => {
  return import('@/components/DialogGallery.vue');
});

const LazyBaseLoading = defineAsyncComponent({
  loader: () => {
    return import('@/components/ui/BaseLoading.vue');
  },
  suspensible: false,
});

const LazyFormPost = defineAsyncComponent(() => {
  return import('./components/FormPost.vue');
});

const LazyDialogConfirmation = defineAsyncComponent(() => {
  return import('@/components/DialogConfirmation.vue');
});

const route = useRoute();

const dialogConfirmationDelete = useTemplateRef('dialogConfirmationDelete');
const formPost = useTemplateRef('formPost');

const { reveal, confirm, cancel } = useConfirmDialog();

const windowScroll = reactive(useWindowScroll());

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      blog: 'Блог',
      send: 'Отправить',
      nothingWasFound: 'Ничего не найдено...',
      confirmDelete: 'Удалить пост',
      deleteMessage: 'Вы уверены, что хотите удалить этот пост?',
      myBlog:
        'Мой блог, тут можно заценить мои посты; пишу о жизни непростой, о мыслях, что меня волнуют! Вот и думай головой.',
      postInMyBlog: 'Пост в моём блоге',
      toTheBeginning: 'Наверх',
      postAttachment: {
        _default: 'Вложение к посту,',
        image: '@:postAttachment._default изображение',
        video: '@:postAttachment._default видик',
        audio: '@:postAttachment._default аудио',
      },
    },
    en: {
      blog: 'Blog',
      send: 'Send',
      nothingWasFound: 'Nothing was found...',
      confirmDelete: 'Delete Post',
      deleteMessage: 'Are you sure you want to delete this post?',
      myBlog:
        'My blog, here you can check out my posts; I write about the complexities of life, about thoughts that concern me! So think with your head.',
      postInMyBlog: 'A post in my blog',
      toTheBeginning: 'To the beginning',
      postAttachment: {
        _default: 'Post attachment,',
        image: '@:postAttachment._default image',
        video: '@:postAttachment._default video',
        audio: '@:postAttachment._default audio',
      },
    },
  },
});

const router = useRouter();

const editModeFor = ref<string | null>(null);

const blogContext = await provideBlogContext();

const authContext = useAuthContext();

const posts = computed(() => {
  return (
    blogContext.getPostsQuery.data?.pages.flatMap((page) => {
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
  (state) => {
    if (!state.isScrolling) {
      return;
    }

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
      return !blogContext.getPostsQuery.isFetchingNextPage && blogContext.getPostsQuery.hasNextPage;
    },
    distance: isClient ? globalThis.innerHeight / 2 : 0,
  },
);

useInfiniteScroll(
  () => {
    return isClient ? (globalThis as unknown as Window) : null;
  },
  (state) => {
    if (!state.isScrolling) {
      return;
    }

    const scrollingElement = globalThis.document.scrollingElement;

    if (!scrollingElement) {
      return;
    }

    const scrollTop = scrollingElement.scrollTop;
    const scrollHeightBefore = scrollingElement.scrollHeight;

    return (
      blogContext.getPostsQuery
        .fetchPreviousPage()
        .then(() => {
          scrollingElement.scrollTop = scrollingElement.scrollHeight - scrollHeightBefore + scrollTop;
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
      return !blogContext.getPostsQuery.isFetchingPreviousPage && blogContext.getPostsQuery.hasPreviousPage;
    },
    distance: isClient ? globalThis.innerHeight / 2 : 0,
    direction: 'top',
  },
);

const onSubmit: InstanceType<typeof LazyFormPost>['onSubmit'] = async (post, files) => {
  return blogContext.postPostMutation.mutateAsync({
    body: {
      files: [],
      text: post.text,
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

const post = computed(() => {
  if (!route.params.postId) {
    return null;
  }

  return (
    posts.value.find((post) => {
      return post._meta.id === route.params.postId;
    }) ?? null
  );
});

const shouldRenderButtonUp = computed(() => {
  return isClient && windowScroll.y > globalThis.innerHeight / 2;
});

const queryClient = useQueryClient();

const onClickButtonUp = async () => {
  await router.push({ name: ROUTE_NAMES.BLOG });

  queryClient.setQueryData<(typeof blogContext.getPostsQuery)['data']>(['posts'], () => {
    return {
      pages: [],
      pageParams: [],
    };
  });

  await queryClient.invalidateQueries({ queryKey: ['posts'] });
};

onMounted(() => {
  if (!route.params.postId) {
    return;
  }

  globalThis.document.querySelector(`[data-id="${String(route.params.postId)}"]`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
});

useSeoMeta({
  description: () => {
    if (!route.params.postId) {
      return t('myBlog');
    }

    if (!post.value?.text) {
      return t('postInMyBlog');
    }

    const max = 140;
    const text = post.value.text.replaceAll(/\n+/g, ' ').replaceAll(/\s+/g, ' ').trim();

    if (text.length <= max) {
      return text;
    }

    const textSliced = text.slice(0, max);
    const indexOfLastSpace = textSliced.lastIndexOf(' ');

    if (indexOfLastSpace === -1) {
      return textSliced.slice(0, max - 1) + '…';
    }

    return textSliced.slice(0, indexOfLastSpace) + '…';
  },
  ogImage: () => {
    const image = post.value?.attachments.find((attachment) => {
      return attachment.fileType === FILE_TYPES.IMAGE;
    });

    if (!image) {
      return undefined;
    }

    return {
      url: image.src,
      width: image.metadata.width,
      height: image.metadata.height,
      alt: t('postAttachment.image'),
    };
  },
  ogVideo: () => {
    const video = post.value?.attachments.find((attachment) => {
      return attachment.fileType === FILE_TYPES.VIDEO;
    });

    if (!video) {
      return undefined;
    }

    return {
      url: video.src,
      width: video.metadata.width,
      height: video.metadata.height,
      alt: t('postAttachment.video'),
    };
  },
  ogAudio: () => {
    const audio = post.value?.attachments.find((attachment) => {
      return attachment.fileType === FILE_TYPES.AUDIO;
    });

    if (!audio) {
      return undefined;
    }

    return {
      url: audio.src,
    };
  },
});
</script>

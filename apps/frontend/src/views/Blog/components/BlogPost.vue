<template>
  <article class="w-full bg-background border border-dark rounded-sm cursor-pointer shadow-lg shadow-dark/15">
    <component :is="component.Is" v-bind="component.binds">
      <div class="p-4 flex flex-col">
        <LazyBlogEditPost v-if="isInEditMode" :post ref="blogEditPost" @submit="onSubmit" />
        <template v-else>
          <PostData :post />
          <time
            :datetime="new Date(props.post._meta.createdAt).toISOString()"
            :title="createdAtUpdatedAt"
            class="text-sm mt-4 text-dark flex justify-end items-center gap-0.5"
          >
            {{ sinceCreatedHumanReadable }}
            <BaseIcon v-if="post._meta.updatedAt" :class="ICON._SIZE._SM" :path="mdiPencil" />
          </time>
        </template>
      </div>
      <div v-if="authContext.isAdmin.value" class="flex justify-end border-t border-t-dark p-1 gap-2">
        <BaseButton
          v-for="control in controls"
          class="p-0.5"
          :isLoading="control.isLoading"
          :isDisabled="control.isDisabled"
          :key="control.key"
          @click.stop.prevent="control.onClick"
        >
          <BaseIcon class="text-2xl" :path="control.iconPath" />
        </BaseButton>
      </div>
    </component>
  </article>
</template>

<script setup lang="ts">
import { mdiCancel, mdiContentSave, mdiDelete, mdiPencil } from '@mdi/js';
import { computed, nextTick, defineAsyncComponent, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import PostData from './PostData.vue';

import BaseIcon from '@/components/ui/BaseIcon';
import { ROUTE_NAMES } from '@/router';
import { ICON } from '@/helpers/ui';
import { RouterLink } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton';
import { type PostWithMetaWithSinseTimestamps } from '@/api/posts';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';
import { useAuthContext } from '@/contexts/auth';
import { useBlogContext } from '../contexts/blog';

const LazyBlogEditPost = defineAsyncComponent(() => import('./BlogEditPost.vue'));

const props = defineProps<{
  post: PostWithMetaWithSinseTimestamps;
  onBeforeDelete: () => Promise<boolean>;
  isInEditMode: boolean;
}>();

const emit = defineEmits<{
  changeEditModeFor: [PostWithMetaWithSinseTimestamps['_meta']['id'] | null];
}>();

const blogEditPost = useTemplateRef<InstanceType<typeof LazyBlogEditPost>>('blogEditPost');

const blogContext = useBlogContext();

const authContext = useAuthContext();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      createdAt: 'Создано в { at }',
      updatedAt: 'Изменено в { at }',
      confirmDelete: 'Удалить пост',
      deleteMessage: 'Вы уверены, что хотите удалить этот пост?',
    },
    en: {
      createdAt: 'Created at { at }',
      updatedAt: 'Edited at { at }',
      confirmDelete: 'Delete Post',
      deleteMessage: 'Are you sure you want to delete this post?',
    },
  },
});

const onSubmit: InstanceType<typeof LazyBlogEditPost>['onSubmit'] = async (postData, files) => {
  blogContext.putPostById
    .execute(
      props.post._meta.id,
      {
        ...postData,
        _meta: props.post._meta,
      },
      files,
    )
    .then(() => blogContext.getPosts.execute({ shouldReset: true }));

  closeEditMode();
};

const component = computed(() =>
  props.isInEditMode
    ? {
        Is: 'div',
      }
    : {
        Is: RouterLink,
        binds: {
          to: {
            name: ROUTE_NAMES.BLOG_POST,
            params: {
              postId: props.post._meta.id,
            },
          },
          class: 'hover:text-[initial]',
        },
      },
);

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() => -props.post._meta.sinceCreated);

const createdAtUpdatedAt = computed(() =>
  [
    t('createdAt', { at: new Date(props.post._meta.createdAt).toISOString() }),
    ...(isNotNil(props.post._meta.updatedAt)
      ? [t('updatedAt', { at: new Date(props.post._meta.updatedAt).toISOString() })]
      : []),
  ].join('\n'),
);

const closeEditMode = () => emit('changeEditModeFor', null);

const controls = computed(
  () =>
    [
      ...(props.isInEditMode
        ? [
            {
              key: 'cancel',
              iconPath: mdiCancel,
              isDisabled: false,
              isLoading: false,
              onClick: closeEditMode,
            },
            {
              key: 'save',
              iconPath: mdiContentSave,
              isDisabled: props.post.text === blogEditPost.value?.postData.text,
              isLoading: blogContext.putPostById.isLoading.value,
              onClick: () => blogEditPost.value?.requestSubmit(),
            },
          ]
        : []),
      ...(props.isInEditMode || props.post.filesUrls.length > 0
        ? []
        : [
            {
              key: 'edit',
              iconPath: mdiPencil,
              isDisabled: false,
              isLoading: blogContext.putPostById.isLoading.value,
              onClick: () => {
                emit('changeEditModeFor', props.post._meta.id);

                nextTick(() => blogEditPost.value?.focusTextarea());
              },
            },
          ]),
      {
        key: 'delete',
        iconPath: mdiDelete,
        isDisabled: false,
        isLoading: blogContext.deletePostById.isLoading.value,
        onClick: async () => {
          if (!(await props.onBeforeDelete())) {
            return;
          }

          return blogContext.deletePostById
            .execute(props.post._meta.id)
            .then(() => blogContext.getPosts.execute({ shouldReset: true }));
        },
      },
    ] as const,
);
</script>

<template>
  <article class="w-full bg-background border border-dark rounded-sm shadow-lg shadow-dark/15">
    <RouterLink
      :to="{
        name: ROUTE_NAMES.BLOG_POST,
        params: {
          postId: props.post._meta.id,
        },
      }"
      class="p-4 flex flex-col"
    >
      <LazyFormPost v-if="isInEditMode" :post ref="formPost" @submit="onSubmit" />
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
    </RouterLink>
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
  </article>
</template>

<script setup lang="ts">
import { mdiCancel, mdiContentSave, mdiDelete, mdiPencil } from '@mdi/js';
import { computed, nextTick, defineAsyncComponent, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import PostData from './PostData.vue';

import BaseIcon from '@/components/ui/BaseIcon.vue';
import { ROUTE_NAMES } from '@/router';
import { ICON } from '@/helpers/ui';
import { RouterLink } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';
import { useAuthContext } from '@/contexts/auth';
import { useBlogContext } from '../contexts/blog';
import { isNil } from '@etonee123x/shared/utils/isNil';
import type { components } from '@/types/openapi';
import { pick } from '@etonee123x/shared/utils/pick';

const LazyFormPost = defineAsyncComponent(() => {
  return import('./FormPost.vue');
});

const props = defineProps<{
  post: components['schemas']['PostResponse'];
  onBeforeDelete: () => Promise<boolean>;
  isInEditMode: boolean;
}>();

const emit = defineEmits<{
  changeEditModeFor: [components['schemas']['PostResponse']['_meta']['id'] | null];
}>();

const formPost = useTemplateRef<InstanceType<typeof LazyFormPost>>('formPost');

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

const onSubmit: InstanceType<typeof LazyFormPost>['onSubmit'] = async (post, files) => {
  blogContext.patchPostByIdMutation.mutateAsync({
    params: {
      path: {
        id: props.post._meta.id,
      },
    },
    body: {
      ...pick(post, ['attachments', 'text']),
      files: [],
    },
    bodySerializer: (body) => {
      const formData = new FormData();

      formData.append('text', body.text);
      formData.append(`attachments`, JSON.stringify(body.attachments));

      files.forEach((file) => {
        formData.append('files', file);
      });

      return formData;
    },
  });

  closeEditMode();
};

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() => {
  return props.post._meta.createdAt - Date.now();
});

const createdAtUpdatedAt = computed(() => {
  return [
    t('createdAt', { at: new Date(props.post._meta.createdAt).toISOString() }),
    ...(isNil(props.post._meta.updatedAt)
      ? []
      : [t('updatedAt', { at: new Date(props.post._meta.updatedAt).toISOString() })]),
  ].join('\n');
});

const closeEditMode = () => {
  emit('changeEditModeFor', null);
};

const controls = computed(() => {
  return [
    ...(props.isInEditMode
      ? [
          {
            key: 'save',
            iconPath: mdiContentSave,
            isLoading: blogContext.patchPostByIdMutation.isPending.value,
            onClick: () => {
              return formPost.value?.form?.requestSubmit();
            },
          },
          {
            key: 'cancel',
            iconPath: mdiCancel,
            isDisabled: false,
            isLoading: false,
            onClick: closeEditMode,
          },
        ]
      : [
          {
            key: 'edit',
            iconPath: mdiPencil,
            isDisabled: false,
            isLoading: blogContext.patchPostByIdMutation.isPending.value,
            onClick: () => {
              emit('changeEditModeFor', props.post._meta.id);

              nextTick(() => {
                return formPost.value?.focusTextarea();
              });
            },
          },
        ]),
    {
      key: 'delete',
      iconPath: mdiDelete,
      isDisabled: false,
      isLoading: blogContext.deletePostByIdMutation.isPending.value,
      onClick: async () => {
        if (!(await props.onBeforeDelete())) {
          return;
        }

        return blogContext.deletePostByIdMutation.mutateAsync({
          params: {
            path: {
              id: props.post._meta.id,
            },
          },
        });
      },
    },
  ] as const;
});
</script>

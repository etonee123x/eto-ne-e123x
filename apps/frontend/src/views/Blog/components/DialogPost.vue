<template>
  <BaseDialog isHiddenHeader v-model="isDialogOpen" @close="onDialogClose">
    <article v-if="blogContext.getPostByIdQuery.data.value">
      <PostData
        class="max-w-full w-full h-full max-h-[calc(90dvh-2*4*var(--spacing)-6*var(--spacing)-2*var(--spacing))] overflow-y-auto"
        :post="blogContext.getPostByIdQuery.data.value"
      />
    </article>
    <template #footer>
      <div class="sticky bottom-0 -mb-4 py-4 bg-background text-sm text-dark flex flex-col items-end">
        <time
          v-if="!(isNil(sinceCreatedHumanReadable) || isNil(createdAt))"
          :datetime="createdAt"
          :title="t('createdAt', { at: createdAt })"
        >
          {{ t('created', { since: sinceCreatedHumanReadable }) }}
        </time>
        <time
          v-if="!(isNil(sinceUpdatedHumanReadable) || isNil(updatedAt))"
          :datetime="updatedAt"
          :title="t('updatedAt', { at: updatedAt })"
          class="mt-1"
        >
          {{ t('updated', { since: sinceUpdatedHumanReadable }) }}
        </time>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import BaseDialog from '@/components/ui/BaseDialog.vue';
import { ROUTE_NAMES } from '@/router';
import { useToggle } from '@vueuse/core';
import PostData from './PostData.vue';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';
import { useBlogContext } from '../contexts/blog';
import { isNil } from '@etonee123x/shared/utils/isNil';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      created: 'Создано { since }',
      updated: 'Изменено { since }',
      createdAt: 'Создано в { at }',
      updatedAt: 'Изменено в { at }',
    },
    en: {
      created: 'Created { since }',
      updated: 'Edited { since }',
      createdAt: 'Created at { at }',
      updatedAt: 'Edited at { at }',
    },
  },
});

const route = useRoute();
const router = useRouter();

const blogContext = useBlogContext();

const [isDialogOpen, toggleIsDialogOpen] = useToggle(Boolean(blogContext.getPostByIdQuery.data.value));

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() => {
  return blogContext.getPostByIdQuery.data.value
    ? blogContext.getPostByIdQuery.data.value._meta.createdAt - Date.now()
    : null;
});

const createdAt = computed(() => {
  return (
    blogContext.getPostByIdQuery.data.value &&
    new Date(blogContext.getPostByIdQuery.data.value._meta.createdAt).toISOString()
  );
});

const sinceUpdatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() => {
  return isNil(blogContext.getPostByIdQuery.data.value?._meta.updatedAt)
    ? null
    : blogContext.getPostByIdQuery.data.value._meta.updatedAt - Date.now();
});

const updatedAt = computed(() => {
  return isNil(blogContext.getPostByIdQuery.data.value?._meta.updatedAt)
    ? null
    : new Date(blogContext.getPostByIdQuery.data.value._meta.updatedAt).toISOString();
});

const onDialogClose = () => {
  router.push({ name: ROUTE_NAMES.BLOG });
};

watchEffect(() => {
  return toggleIsDialogOpen(!(blogContext.getPostByIdQuery.isLoading.value || isNil(route.params.postId)));
});
</script>

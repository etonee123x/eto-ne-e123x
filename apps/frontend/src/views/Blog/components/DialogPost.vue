<template>
  <BaseDialog isHiddenHeader v-model="isDialogOpen" @close="onDialogClose">
    <article v-if="blogContext.getPostById.state.value">
      <PostData
        class="max-w-full w-full h-full max-h-[calc(90dvh-2*4*var(--spacing)-6*var(--spacing)-2*var(--spacing))] overflow-y-auto"
        :post="blogContext.getPostById.state.value"
      />
    </article>
    <template #footer>
      <div class="sticky bottom-0 -mb-4 py-4 bg-background text-sm text-dark flex flex-col items-end">
        <time
          v-if="isNotNil(sinceCreatedHumanReadable) && isNotNil(createdAt)"
          :datetime="createdAt"
          :title="t('createdAt', { at: createdAt })"
        >
          {{ t('created', { since: sinceCreatedHumanReadable }) }}
        </time>
        <time
          v-if="isNotNil(sinceUpdatedHumanReadable) && isNotNil(updatedAt)"
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
import { useRouter } from 'vue-router';

import BaseDialog from '@/components/ui/BaseDialog.vue';
import { ROUTE_NAMES } from '@/router';
import { useToggle } from '@vueuse/core';
import PostData from './PostData.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';
import { useBlogContext } from '../contexts/blog';

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

const router = useRouter();

const blogContext = useBlogContext();

const [isDialogOpen, toggleIsDialogOpen] = useToggle(Boolean(blogContext.getPostById.state.value));

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() =>
  blogContext.getPostById.state.value ? -blogContext.getPostById.state.value._meta.sinceCreated : null,
);

const createdAt = computed(
  () =>
    blogContext.getPostById.state.value && new Date(blogContext.getPostById.state.value._meta.createdAt).toISOString(),
);

const sinceUpdatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() =>
  isNotNil(blogContext.getPostById.state.value?._meta.sinceUpdated)
    ? -blogContext.getPostById.state.value._meta.sinceUpdated
    : null,
);

const updatedAt = computed(() =>
  isNotNil(blogContext.getPostById.state.value?._meta.updatedAt)
    ? new Date(blogContext.getPostById.state.value._meta.updatedAt).toISOString()
    : null,
);

const onDialogClose = () => {
  router.push({ name: ROUTE_NAMES.BLOG });
};

watchEffect(() => toggleIsDialogOpen(Boolean(blogContext.getPostById.state.value)));
</script>

<template>
  <BaseDialog isHiddenHeader v-model="isDialogOpen" @close="onDialogClose">
    <article v-if="blog.getPostById.state.value">
      <PostData
        class="max-w-full w-full h-full max-h-[calc(90dvh-2*4*var(--spacing)-6*var(--spacing)-2*var(--spacing))] overflow-y-auto"
        :post="blog.getPostById.state.value"
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
import { useBlog } from '@/plugins/blog';

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

const blog = useBlog();

const [isDialogOpen, toggleIsDialogOpen] = useToggle(Boolean(blog.getPostById.state.value));

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() =>
  blog.getPostById.state.value ? -blog.getPostById.state.value._meta.sinceCreated : null,
);

const createdAt = computed(
  () => blog.getPostById.state.value && new Date(blog.getPostById.state.value._meta.createdAt).toISOString(),
);

const sinceUpdatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() =>
  isNotNil(blog.getPostById.state.value?._meta.sinceUpdated) ? -blog.getPostById.state.value._meta.sinceUpdated : null,
);

const updatedAt = computed(() =>
  isNotNil(blog.getPostById.state.value?._meta.updatedAt)
    ? new Date(blog.getPostById.state.value._meta.updatedAt).toISOString()
    : null,
);

const onDialogClose = () => {
  router.push({ name: ROUTE_NAMES.BLOG });
};

watchEffect(() => toggleIsDialogOpen(Boolean(blog.getPostById.state.value)));
</script>

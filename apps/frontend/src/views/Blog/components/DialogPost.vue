<template>
  <BaseDialog isHiddenHeader v-model="isDialogOpen" @close="onDialogClose">
    <article v-if="blogStore.byId">
      <PostData
        class="max-w-full w-full h-full max-h-[calc(90dvh_-2*4*var(--spacing)_-6*var(--spacing)_-2*var(--spacing))] overflow-y-auto"
        :post="blogStore.byId"
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

<i18n lang="yaml">
En:
  created: 'Created { since }'
  updated: 'Edited { since }'
  createdAt: 'Created at { at }'
  updatedAt: 'Edited at { at }'
Ru:
  created: 'Создано { since }'
  updated: 'Изменено { since }'
  createdAt: 'Создано в { at }'
  updatedAt: 'Изменено в { at }'
</i18n>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BaseDialog from '@/components/ui/BaseDialog.vue';
import { useBlogStore } from '@/stores/blog';
import { RouteName } from '@/router';
import { useToggle } from '@vueuse/core';
import PostData from './PostData.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';

const { t } = useI18n({ useScope: 'local' });

const router = useRouter();

const blogStore = useBlogStore();

const [isDialogOpen, toggleIsDialogOpen] = useToggle(Boolean(blogStore.byId));

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() =>
  blogStore.byId ? -blogStore.byId._meta.sinceCreated : null,
);

const createdAt = computed(() => blogStore.byId && new Date(blogStore.byId._meta.createdAt).toISOString());

const sinceUpdatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() =>
  isNotNil(blogStore.byId?._meta.sinceUpdated) ? -blogStore.byId._meta.sinceUpdated : null,
);

const updatedAt = computed(() =>
  isNotNil(blogStore.byId?._meta.updatedAt) ? new Date(blogStore.byId._meta.updatedAt).toISOString() : null,
);

const onDialogClose = () => {
  router.push({ name: RouteName.Blog });
};

watchEffect(() => toggleIsDialogOpen(Boolean(blogStore.byId)));
</script>

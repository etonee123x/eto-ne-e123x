<template>
  <RouterLink :to="element.url" class="explorer-element">
    <article>
      <header class="flex justify-between">
        <div class="explorer-element__title">
          {{ element.name }}
        </div>
        <time :datetime="createdAt" :title="t('createdAt', { at: createdAt })" class="text-right m-2">
          {{ sinceCreatedHumanReadable }}
        </time>
      </header>
      <hr />
      <div class="p-2">
        <slot />
      </div>
    </article>
  </RouterLink>
</template>

<script setup lang="ts">
import type { ItemFile } from '@etonee123x/shared/helpers/folderData';

import type { WithMeta, WithSinceTimestamps } from '@etonee123x/shared/types/database';
import { useI18n } from 'vue-i18n';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';
import { computed } from 'vue';

const props = defineProps<{
  element: ItemFile & WithMeta<WithSinceTimestamps>;
}>();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    Ru: {
      createdAt: 'Создано в { at }',
    },
    En: {
      createdAt: 'Created at { at }',
    },
  },
});

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() => -props.element._meta.sinceCreated);

const createdAt = computed(() => new Date(props.element._meta.createdAt).toISOString());
</script>

<template>
  <RouterLink :to class="explorer-element">
    <article>
      <header class="flex justify-between p-2">
        <h2 class="explorer-element__title">
          {{ element.name }}
        </h2>
        <time :datetime="createdAt" data-allow-mismatch="text" :title="t('createdAt', { at: createdAt })">
          {{ sinceCreatedHumanReadable }}
        </time>
      </header>
      <div class="p-2 border-t border-t-primary-500">
        <slot />
      </div>
    </article>
  </RouterLink>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';
import { computed } from 'vue';
import type { components } from '@/types/openapi';
import type { RouterLinkProps } from 'vue-router';

export interface Props {
  element: components['schemas']['FolderDataItemFile'];
  to: RouterLinkProps['to'];
}

const props = defineProps<Props>();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      createdAt: 'Создано в { at }',
    },
    en: {
      createdAt: 'Created at { at }',
    },
  },
});

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() => {
  return props.element._meta.createdAt - Date.now();
});

const createdAt = computed(() => {
  return new Date(props.element._meta.createdAt).toISOString();
});
</script>

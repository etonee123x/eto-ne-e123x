<template>
  <article class="explorer-element">
    <RouterLink data-overlay-link :to class="inset-0 absolute focus:outline-none z-1" />

    <header class="flex p-(--explorer-element-padding) relative">
      <slot name="title">
        <h2 class="explorer-element__title">
          {{ element.name }}
        </h2>
      </slot>
      <time class="ms-auto" :datetime="createdAt" data-allow-mismatch="text" :title="t('createdAt', { at: createdAt })">
        {{ sinceCreatedHumanReadable }}
      </time>
    </header>

    <slot />
  </article>
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

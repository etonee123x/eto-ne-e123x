<template>
  <span>
    <span v-if="isFull" :class="CLASSES">
      {{ t('loading') }}
    </span>
    <span v-else :class="CLASSES" class="after:translate-x-1/2 after:end-0" />
  </span>
</template>

<i18n lang="yaml">
En:
  loading: 'Loading'
Ru:
  loading: 'Загрузка'
</i18n>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ isFull?: boolean }>();

const { t } = useI18n({ useScope: 'local' });

const CLASSES = ['relative', 'after:absolute', "after:[--tw-content:'.']", 'after:animate-loading'];
</script>

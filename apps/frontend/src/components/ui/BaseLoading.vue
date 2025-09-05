<template>
  <span>
    <span v-if="isFull" :class="CLASSES">
      {{ t('loading') }}
    </span>
    <span v-else :class="CLASSES" class="after:translate-x-1/2 after:end-0" />
  </span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ isFull?: boolean }>();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    Ru: {
      loading: 'Загрузка',
    },
    En: {
      loading: 'Loading',
    },
  },
});

const CLASSES = ['relative', 'after:absolute', "after:content-['.']", 'after:animate-loading'];
</script>

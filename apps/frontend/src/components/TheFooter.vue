<template>
  <footer class="border-t border-t-primary-500">
    <address class="layout-container py-4 flex gap-2 items-center italic">
      <a rel="noopener noreferrer" target="_blank" :href="`https://t.me/${ETO_NE_E123X}`" class="flex gap-2">
        <img class="size-6" src="@/assets/icons/telegram.svg" :alt="t('telegramLogo')" />
        {{ ETO_NE_E123X }}
      </a>
    </address>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      telegramLogo: 'Telegram logo',
    },
    ru: {
      telegramLogo: 'Логотип телеграм',
    },
  },
});

const ETO_NE_E123X = 'eto_ne_e123x';
</script>

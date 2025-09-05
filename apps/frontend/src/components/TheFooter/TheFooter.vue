<template>
  <footer class="border-t border-t-dark">
    <address class="layout-container mx-auto py-2 flex gap-2 items-center">
      <a target="_blank" href="https://t.me/eto_ne_e123x">
        <img class="size-6" src="./assets/icons/Logo.svg" :alt="t('telegramLogo')" />
      </a>
    </address>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    En: {
      telegramLogo: 'Telegram logo',
    },
    Ru: {
      telegramLogo: 'Логотип телеграм',
    },
  },
});
</script>

<template>
  <div class="flex flex-col min-h-dvh group/app">
    <TheHeader class="fixed top-0 w-full z-1 h-header-height" />
    <main class="[scrollbar-gutter:stable_both-edges] pt-header-height relative flex flex-col flex-1">
      <RouterView />
      <LazyTheNotifications
        v-if="notifications.notifications.length > 0"
        class="sticky bottom-4 group-has-data-player/app:bottom-30 mx-auto"
      />
    </main>
    <LazyThePlayer v-if="player.theTrack.value" class="sticky bottom-0" />
    <LazyTheFooter v-else />
    <TheDialogGallery />
  </div>
</template>

<script setup lang="ts">
import { useHead, useSeoMeta } from '@unhead/vue';
import { defineAsyncComponent } from 'vue';
import themes from '@/assets/styles/themes.json';

import TheHeader from '@/components/TheHeader.vue';
import { isServer } from '@/constants/target';
import { i18n } from '@/plugins/i18n';
import { SITE_TITLE } from '@/constants/siteTitle';
import TheDialogGallery from '@/components/TheDialogGallery.vue';
import { useNotifications } from '@/plugins/notifications';
import { usePlayer } from '@/plugins/player';
import { provideAuthContext } from '@/contexts/auth';
import { provideExplorerContext } from '@/views/Explorer/contexts/explorer';
import { nonNullable } from '@/utils/nonNullable';
import { provideBlogContext } from '@/views/Blog/contexts/blog';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const LazyThePlayer = defineAsyncComponent(() => {
  return import('@/components/ThePlayer/ThePlayer.vue');
});
const LazyTheNotifications = defineAsyncComponent(() => {
  return import('@/components/TheNotifications.vue');
});
const LazyTheFooter = defineAsyncComponent(() => {
  return import('@/components/TheFooter.vue');
});

const { t } = useI18n({
  messages: {
    ru: {
      siteLogo: 'Логотип сайта',
    },
    en: {
      siteLogo: 'Site logo',
    },
  },
});

provideAuthContext();

// Странно, да. Контексты отправляю тут, а не на страницах. Контексты получились асинхронными, в них грузятся данные.
// Если их инициализировать на страницах, то СТАТИЧЕСКИЕ названия не будут отображться при загрузке страницы на клиенте
await Promise.all([
  //
  provideExplorerContext(),
  provideBlogContext(),
]);

const route = useRoute();

const player = usePlayer();
const notifications = useNotifications();

useHead({
  titleTemplate: (title) => {
    return [
      ...(isNil(title)
        ? []
        : [
            //
            title,
          ]),
      SITE_TITLE,
    ].join(' | ');
  },
  htmlAttrs: {
    lang: () => {
      return i18n.global.locale.value.toLocaleLowerCase();
    },
  },

  ...(isServer
    ? {
        style: [
          {
            textContent: `:root { ${nonNullable(themes.at(Date.now() % themes.length)).content} }`,
          },
        ],
      }
    : {}),
});

useSeoMeta({
  ogUrl: () => {
    return route.fullPath;
  },
  ogImage: () => {
    return {
      url: '/E123.jpg',
      alt: t('siteLogo'),
      width: 1000,
      height: 1000,
      type: 'image/jpeg',
    };
  },
});
</script>

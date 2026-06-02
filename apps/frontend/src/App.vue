<template>
  <div class="contents group/app">
    <TheHeader class="fixed top-0 w-full z-header h-header-height" />
    <main class="pt-header-height relative flex flex-col flex-1">
      <Suspense suspensible>
        <RouterView />
      </Suspense>
      <!-- TODO: глянуть чо с ними не так -->
      <LazyTheNotifications
        v-if="notifications.notifications.length > 0"
        class="fixed bottom-4 group-has-data-player/app:bottom-32 mx-auto"
      />
    </main>
    <LazyThePlayer v-if="shouldRenderPlayer" class="sticky bottom-0" />
    <LazyTheFooter />
  </div>
</template>

<script setup lang="ts">
import { useHead, useSeoMeta } from '@unhead/vue';
import { computed, defineAsyncComponent, reactive } from 'vue';
import themes from '@/assets/styles/themes.json';

import TheHeader from '@/components/TheHeader.vue';
import { isServer } from '@/constants/target';
import { i18n } from '@/plugins/i18n';
import { SITE_TITLE } from '@/constants/siteTitle';
import { useNotifications } from '@/plugins/notifications';
import { usePlayer } from '@/plugins/player';
import { provideAuthContext } from '@/contexts/auth';
import { nonNullable } from '@/utils/nonNullable';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ROUTE_NAMES } from '@/plugins/router';
import { useSegments } from '@/views/Explorer/composables/useSegments';
import { useQueryGetFolderData } from '@/views/Explorer/composables/useQueryGetFolderData';
import { FILE_TYPES } from './helpers/folderData';

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

const route = useRoute();

const segments = useSegments();

const queryGetFolderData = reactive(
  useQueryGetFolderData(
    { segments },
    {
      enabled: () => {
        return route.name === ROUTE_NAMES.EXPLORER;
      },
    },
  ),
);

if (queryGetFolderData.isEnabled) {
  await queryGetFolderData.suspense();
}

const player = usePlayer();

const shouldRenderPlayer = computed(() => {
  if (isServer) {
    return queryGetFolderData.data?.file?.fileType === FILE_TYPES.AUDIO;
  }

  return Boolean(player.theTrack.value);
});

const notifications = useNotifications();

useHead({
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

<template>
  <Suspense>
    <div class="flex flex-col bg-background min-h-dvh group/app">
      <TheHeader />
      <main class="[scrollbar-gutter:stable_both-edges] relative flex flex-col flex-1">
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
  </Suspense>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { defineAsyncComponent, onServerPrefetch } from 'vue';
import themes from '@/assets/styles/themes.json';

import TheHeader from '@/components/TheHeader.vue';
import { isServer } from '@/constants/target';
import { useRoute } from 'vue-router';
import { ROUTE_NAMES } from '@/router';
import { clientOnly } from '@/helpers/clientOnly';
import { i18n } from '@/i18n';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { useGoToPage404 } from '@/composables/useGoToPage404';
import { SITE_TITLE } from '@/constants/siteTitle';
import TheDialogGallery from '@/components/TheDialogGallery.vue';
import { useNotifications } from '@/plugins/notifications';
import { usePlayer } from '@/plugins/player';
import { provideAuthContext } from '@/contexts/auth';
import { provideExplorerContext } from '@/views/Explorer/contexts/explorer';
import { nonNullable } from '@/utils/nonNullable';

const LazyThePlayer = defineAsyncComponent(() => import('@/components/ThePlayer'));
const LazyTheNotifications = defineAsyncComponent(() => import('@/components/TheNotifications.vue'));
const LazyTheFooter = defineAsyncComponent(() => import('@/components/TheFooter.vue'));

provideAuthContext();
const explorerContext = provideExplorerContext();

const route = useRoute();

const goToPage404 = useGoToPage404();

const player = usePlayer();
const notifications = useNotifications();

if (route.name === ROUTE_NAMES.EXPLORER) {
  const getFolderData = () => explorerContext.getFolderData.execute(route).catch(goToPage404);

  onServerPrefetch(getFolderData);
  clientOnly(getFolderData);
}

useHead({
  titleTemplate: (title) =>
    [
      ...(isNotNil(title)
        ? [
            //
            title,
          ]
        : []),
      SITE_TITLE,
    ].join(' | '),
  htmlAttrs: {
    lang: () => i18n.global.locale.value.toLocaleLowerCase(),
  },
});

if (isServer) {
  useHead({
    style: [
      {
        // Всё ок
        // eslint-disable-next-line sonarjs/pseudo-random
        textContent: `:root { --accent: ${nonNullable(themes[Math.floor(Math.random() * themes.length)]).accent}; }`,
      },
    ],
  });
}
</script>

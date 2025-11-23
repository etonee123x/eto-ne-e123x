import { createSSRApp } from 'vue';

import { createRouter } from '@/router';
import { i18n } from '@/i18n';
import App from '@/App.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { dialogsIds } from '@/plugins/dialogsIds';
import { notifications } from '@/plugins/notifications';
import { createPlayer } from '@/plugins/player';
import { createGallery } from '@/plugins/gallery';
import { VueQueryPlugin, QueryClient, keepPreviousData } from '@tanstack/vue-query';

export const createApp = (context: Partial<{ url: string }> = {}) => {
  const app = createSSRApp(App);

  app.use(notifications);
  app.use(dialogsIds);
  app.use(i18n);

  const gallery = createGallery();
  app.use(gallery, globalThis.__GALLERY__);

  const player = createPlayer();
  app.use(player, globalThis.__PLAYER__);

  const router = createRouter();
  app.use(router);
  if (isNotNil(context.url)) {
    router.push(context.url);
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        throwOnError: true,
        placeholderData: keepPreviousData,
      },
    },
  });
  app.use(VueQueryPlugin, { queryClient });

  return { app, router, i18n, player, gallery, queryClient };
};

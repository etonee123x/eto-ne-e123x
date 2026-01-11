import { createSSRApp, h, Suspense } from 'vue';

import { createRouter } from '@/router';
import { i18n } from '@/i18n';
import App from '@/App.vue';
import { dialogsIds } from '@/plugins/dialogsIds';
import { notifications } from '@/plugins/notifications';
import { createPlayer } from '@/plugins/player';
import { createGallery } from '@/plugins/gallery';
import { VueQueryPlugin, QueryClient, keepPreviousData } from '@tanstack/vue-query';
import { isNil } from '@etonee123x/shared/utils/isNil';

export const createApp = (context: Partial<{ url: string }> = {}) => {
  const app = createSSRApp({
    render: () => {
      return h(Suspense, null, {
        default: () => {
          return h(App);
        },
      });
    },
  });

  app.use(notifications);
  app.use(dialogsIds);
  app.use(i18n);

  const gallery = createGallery();
  app.use(gallery);

  const player = createPlayer();
  app.use(player);

  const router = createRouter();
  app.use(router);
  if (!isNil(context.url)) {
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

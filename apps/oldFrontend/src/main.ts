import { createSSRApp, h, Suspense } from 'vue';

import { createRouter } from '@/plugins/router';
import { i18n } from '@/plugins/i18n';
import App from '@/App.vue';
import { dialogsIds } from '@/plugins/dialogsIds';
import { notifications } from '@/plugins/notifications';
import { createPlayer } from '@/plugins/player';
import { VueQueryPlugin, QueryClient, keepPreviousData } from '@tanstack/vue-query';
import { isNil } from '@etonee123x/shared/utils/isNil';

export const createApp = (context: Partial<{ url: string }> = {}) => {
  console.count('createApp');
  const app = createSSRApp({
    render: () => {
      return h(Suspense, null, {
        default: () => {
          return h(App);
        },
      });
    },
  });
  console.count('createApp');

  app.use(notifications);

  console.count('createApp');
  app.use(dialogsIds);

  console.count('createApp');
  app.use(i18n);

  console.count('createApp');
  const player = createPlayer();

  console.count('createApp');
  app.use(player);

  console.count('createApp');

  const router = createRouter();

  console.count('createApp');
  app.use(router);

  console.count('createApp');
  if (!isNil(context.url)) {
    router.push(context.url);
  }

  console.count('createApp');

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

  console.count('createApp');
  app.use(VueQueryPlugin, {
    queryClient,
    enableDevtoolsV6Plugin: true,
  });

  console.count('createApp');

  return { app, router, i18n, player, queryClient };
};

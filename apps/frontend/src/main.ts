import { createSSRApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import { createRouter } from '@/router';
import { i18n } from '@/i18n';
import App from '@/App.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { dialogsIds } from '@/plugins/dialogsIds';
import { loadingSources } from '@/plugins/loadingSources';
import { notifications } from '@/plugins/notifications';
import { auth } from '@/plugins/auth';
import { createPlayer } from '@/plugins/player';

export const createApp = (context: Partial<{ url: string }> = {}) => {
  const app = createSSRApp(App);

  app.use(notifications);
  app.use(loadingSources);
  app.use(auth);
  app.use(dialogsIds);
  app.use(i18n);

  const player = createPlayer();

  app.use(player, globalThis.__PLAYER__);

  const pinia = createPinia();

  setActivePinia(pinia);
  app.use(pinia);

  const router = createRouter();

  app.use(router);

  if (isNotNil(context.url)) {
    router.push(context.url);
  }

  return { app, router, pinia, i18n, player };
};

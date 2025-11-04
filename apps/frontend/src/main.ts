import { createSSRApp } from 'vue';

import { createRouter } from '@/router';
import { i18n } from '@/i18n';
import App from '@/App.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { dialogsIds } from '@/plugins/dialogsIds';
import { loadingSources } from '@/plugins/loadingSources';
import { notifications } from '@/plugins/notifications';
import { createPlayer } from '@/plugins/player';
import { createGallery } from '@/plugins/gallery';

export const createApp = (context: Partial<{ url: string }> = {}) => {
  const app = createSSRApp(App);

  app.use(notifications);
  app.use(loadingSources);
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

  return { app, router, i18n, player, gallery };
};

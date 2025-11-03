import { createSSRApp } from 'vue';

import { createRouter } from '@/router';
import { i18n } from '@/i18n';
import App from '@/App.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { dialogsIds } from '@/plugins/dialogsIds';
import { loadingSources } from '@/plugins/loadingSources';
import { notifications } from '@/plugins/notifications';
import { auth } from '@/plugins/auth';
import { createPlayer } from '@/plugins/player';
import { createGallery } from '@/plugins/gallery';
import { createExplorer } from '@/plugins/explorer';
import { createBlog } from '@/plugins/blog';

export const createApp = (context: Partial<{ url: string }> = {}) => {
  const app = createSSRApp(App);

  app.use(notifications);
  app.use(loadingSources);
  app.use(auth);
  app.use(dialogsIds);
  app.use(i18n);

  const blog = createBlog();

  app.use(blog, globalThis.__BLOG__);

  const gallery = createGallery();

  app.use(gallery, globalThis.__GALLERY__);

  const explorer = createExplorer();

  app.use(explorer, globalThis.__EXPLORER__);

  const player = createPlayer();

  app.use(player, globalThis.__PLAYER__);

  const router = createRouter();

  app.use(router);

  if (isNotNil(context.url)) {
    router.push(context.url);
  }

  return { app, router, i18n, player, gallery, explorer, blog };
};

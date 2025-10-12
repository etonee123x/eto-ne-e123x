import { createSSRApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import { createRouter } from '@/router';
import { i18n } from '@/i18n';
import App from '@/App.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { dialogsIds } from '@/plugins/dialogsIds';
import { loadingSources } from '@/plugins/loadingSources';
import { auth } from '@/plugins/auth';

export const createApp = (context: Partial<{ url: string }> = {}) => {
  const app = createSSRApp(App);

  const pinia = createPinia();

  setActivePinia(pinia);
  app.use(pinia);

  const router = createRouter();

  app.use(router);

  if (isNotNil(context.url)) {
    router.push(context.url);
  }

  app.use(dialogsIds);

  app.use(loadingSources);

  app.use(auth);

  app.use(i18n);

  return { app, router, pinia, i18n };
};

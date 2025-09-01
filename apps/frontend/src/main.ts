import { createSSRApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import { createRouter } from '@/router';
import { i18n } from '@/i18n';
import App from '@/App.vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';

import { toTemporalInstant, type Temporal } from '@js-temporal/polyfill';

// TODO убрать после стабилизации Temporal и Intl.DurationFormat
declare global {
  interface Date {
    toTemporalInstant(): Temporal.Instant;
  }
}

Date.prototype.toTemporalInstant = toTemporalInstant;

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

  app.use(i18n);

  return { app, router, pinia, i18n };
};

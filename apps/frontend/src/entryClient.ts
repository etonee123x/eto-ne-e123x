import { useCookies } from '@vueuse/integrations/useCookies';
import { createApp } from '@/main';
import { createHead } from '@unhead/vue/client';
import { isKnownLocale } from '@/helpers/isKnownLocale';

const { app, router, pinia, i18n } = createApp();

const head = createHead();

app.use(head);

if (globalThis.__PINIA__) {
  pinia.state.value = globalThis.__PINIA__;
}

const cookies = useCookies();

router.isReady().then(() => {
  const routerLanguage = router.currentRoute.value.params.language?.toString();

  i18n.global.locale.value = isKnownLocale(routerLanguage) ? routerLanguage : cookies.get('language');

  app.mount('#app', true);
});

import { useCookies } from '@vueuse/integrations/useCookies';
import { createApp } from '@/main';
import { createHead } from '@unhead/vue/client';
import { isKnownLocale } from '@/helpers/isKnownLocale';
import { hydrate } from '@tanstack/vue-query';
import { CanonicalPlugin, InferSeoMetaPlugin } from 'unhead/plugins';

console.count('entryClient');

const { app, router, i18n, queryClient, player } = createApp();
console.count('entryClient');

if (globalThis.__QUERY__) {
  hydrate(queryClient, globalThis.__QUERY__);
}
console.count('entryClient');

player.init();
console.count('entryClient');

const head = createHead({
  plugins: [
    InferSeoMetaPlugin({
      twitterCard: false,
    }),
    CanonicalPlugin({
      canonicalHost: globalThis.location.host,
    }),
  ],
});
console.count('entryClient');

app.use(head);
console.count('entryClient');

const cookies = useCookies();
console.count('entryClient');

await router.isReady();
console.count('entryClient');

const routerLanguage = router.currentRoute.value.params.language?.toString();
console.count('entryClient');

i18n.global.locale.value = isKnownLocale(routerLanguage) ? routerLanguage : cookies.get('language');
console.count('entryClient');

app.mount('#app', true);

console.count('entryClient');

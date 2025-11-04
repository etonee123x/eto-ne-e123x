import { useCookies } from '@vueuse/integrations/useCookies';
import { createApp } from '@/main';
import { createHead } from '@unhead/vue/client';
import { isKnownLocale } from '@/helpers/isKnownLocale';

const { app, router, i18n } = createApp();

const head = createHead();

app.use(head);

const cookies = useCookies();

await router.isReady();

const routerLanguage = router.currentRoute.value.params.language?.toString();

i18n.global.locale.value = isKnownLocale(routerLanguage) ? routerLanguage : cookies.get('language');

app.mount('#app', true);

import { renderToString } from 'vue/server-renderer';
import { createApp } from '@/main';
import { createHead } from '@unhead/vue/server';
import type { ExpressContext } from '@/constants/injectionKeyExpressContext';
import { isClient } from './constants/target';
import type { SSRContext } from '@/composables/useSsrContext';
import { isKnownLocale } from '@/helpers/isKnownLocale';
import { dehydrate } from '@tanstack/vue-query';

export const render = async (url: string, expressContext: ExpressContext) => {
  const { app, router, i18n, player, gallery, queryClient } = createApp({ url });

  app.config.errorHandler = (error) => {
    console.error('Error in app', error);

    if (isClient || expressContext.response.headersSent) {
      return;
    }

    expressContext.response.redirect('/404');
  };

  const head = createHead();

  app.use(head);

  const context: SSRContext = {
    teleports: {},
    express: expressContext,
  };

  await router.isReady();

  const routerLanguage = router.currentRoute.value.params.language?.toString();

  i18n.global.locale.value = isKnownLocale(routerLanguage) //
    ? routerLanguage
    : expressContext.request.cookies.language;

  const html = await renderToString(app, context);

  head.push({
    script: [
      {
        innerHTML: `window.__QUERY__ = ${JSON.stringify(dehydrate(queryClient))}`,
      },
      {
        innerHTML: `window.__PLAYER__ = ${JSON.stringify(player.state.value)}`,
      },
      {
        innerHTML: `window.__GALLERY__ = ${JSON.stringify(gallery.state.value)}`,
      },
    ],
  });

  return {
    html,
    head,
    teleports: context.teleports,
  };
};

import { renderToString } from 'vue/server-renderer';
import { createApp } from '@/main';
import { createHead } from '@unhead/vue/server';
import type { ExpressContext } from '@/constants/injectionKeyExpressContext';
import { isClient } from './constants/target';
import { type SSRContext } from '@/composables/useSSRContext';
import { isKnownLocale } from '@/helpers/isKnownLocale';

export const render = async (url: string, expressContext: ExpressContext) => {
  const { app, router, i18n, player, gallery } = createApp({ url });

  app.config.errorHandler = (error) => {
    console.error('Error in app', error);

    if (isClient || expressContext.response.headersSent) {
      return;
    }

    // expressContext.response.redirect('/404');
  };

  const head = createHead();

  app.use(head);

  const context: SSRContext = {
    payload: {},
    teleports: {},
    express: expressContext,
  };

  return router
    .isReady()
    .then(() => {
      const routerLanguage = router.currentRoute.value.params.language?.toString();

      i18n.global.locale.value = isKnownLocale(routerLanguage)
        ? routerLanguage
        : expressContext.request.cookies.language;

      return renderToString(app, context);
    })
    .then((html) => {
      head.push({
        script: [
          {
            innerHTML: `window.__PAYLOAD__ = ${JSON.stringify(context.payload)}`,
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
    });
};

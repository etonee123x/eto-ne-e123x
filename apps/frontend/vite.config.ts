import { resolve } from 'path';

import { defineConfig, type UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import VueDevTools from 'vite-plugin-vue-devtools';
import { ssrAutoKey } from './src/plugins/ssrAutoKey';
import { getAuthorization } from './src/helpers/getAuthorization';
import { isAppModeDevelopment } from './src/constants/appMode';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      //
      VueDevTools(),
      vue(),
      ssrAutoKey(),
      tailwindcss(),
    ],
    publicDir: 'public',
    // Костыль, какие то глубокие импорты, ещё какая то хрень. TODO: заменить vue-i18n --> i18n-next
    ssr: { noExternal: ['vue-i18n'] },
  };

  if (isAppModeDevelopment) {
    const Authorization = getAuthorization();

    config.server = {
      proxy: {
        '/api': {
          target: process.env.SERVER_ORIGIN,
          changeOrigin: true,
          secure: true,
          headers: {
            Authorization,
          },
        },
        '/uploads': {
          target: process.env.SERVER_ORIGIN,
          changeOrigin: true,
          secure: true,
          headers: {
            Authorization,
          },
        },
        '/content': {
          target: process.env.SERVER_ORIGIN,
          changeOrigin: true,
          secure: true,
          headers: {
            Authorization,
          },
        },
      },
    };
  }

  return config;
});

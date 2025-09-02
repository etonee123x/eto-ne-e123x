import { resolve } from 'path';

import { defineConfig, type UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import tailwindcss from '@tailwindcss/vite';
import VueDevTools from 'vite-plugin-vue-devtools';
import { ssrAutoKey } from './src/plugins/ssrAutoKey';
import { isDevelopment } from './src/constants/mode';

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
      VueI18nPlugin(),
      tailwindcss(),
    ],
    publicDir: 'public',
  };

  if (isDevelopment) {
    const Authorization = `Basic ${Buffer.from([process.env.BASIC_USER, process.env.BASIC_PASSWORD].join(':')).toString('base64')}`;

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

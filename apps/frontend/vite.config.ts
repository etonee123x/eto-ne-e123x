import { resolve } from 'path';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import tailwindcss from '@tailwindcss/vite';
import VueDevTools from 'vite-plugin-vue-devtools';
import { ssrAutoKey } from './src/plugins/ssrAutoKey';

export default defineConfig((configEnv) => {
  const env = loadEnv(configEnv.mode, process.cwd(), '');

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.API_ORIGIN,
          changeOrigin: true,
          secure: true,
          headers: {
            Authorization: `Basic ${Buffer.from([env.BASIC_USER, env.BASIC_PASSWORD].join(':')).toString('base64')}`,
          },
        },
      },
    },
    plugins: [VueDevTools(), vue(), ssrAutoKey(), VueI18nPlugin({}), tailwindcss()],
    publicDir: 'public',
  };
});

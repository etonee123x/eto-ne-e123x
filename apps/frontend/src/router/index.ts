import { createMemoryHistory, createRouter as _createRouter, createWebHistory } from 'vue-router';

import { isServer } from '@/constants/target';
import { isDevelopment } from '@/constants/mode';

export const ROUTE_NAMES = {
  EXPLORER: 'EXPLORER',
  INDEX: 'INDEX',
  BLOG: 'BLOG',
  BLOG_POST: 'BLOG_POST',
  PLAYGROUND: 'PLAYGROUND',
  PAGE_404_GLOBAL: 'PAGE_404_GLOBAL',
  PAGE_404: 'PAGE_404',
} as const;

export const ROUTE_NAME_TO_PATH = {
  [ROUTE_NAMES.EXPLORER]: 'explorer',
  [ROUTE_NAMES.INDEX]: '',
  [ROUTE_NAMES.BLOG]: 'blog',
} as const;

export const createRouter = () =>
  _createRouter({
    routes: [
      {
        path: '/:language(ru|en)',
        children: [
          {
            name: ROUTE_NAMES.INDEX,
            path: ROUTE_NAME_TO_PATH.INDEX,
            component: () => import('@/views/Index'),
          },
          {
            path: `${ROUTE_NAME_TO_PATH.EXPLORER}/:links(.*)*`,
            name: ROUTE_NAMES.EXPLORER,
            component: () => import('@/views/Explorer'),
          },
          {
            path: ROUTE_NAME_TO_PATH.BLOG,
            children: [
              {
                name: ROUTE_NAMES.BLOG,
                path: '',
                component: () => import('@/views/Blog'),
              },
              {
                name: ROUTE_NAMES.BLOG_POST,
                path: ':postId',
                component: () => import('@/views/Blog'),
              },
            ],
          },
          {
            name: ROUTE_NAMES.PAGE_404,
            path: ':pathMatch(.*)*',
            component: () => import('@/views/Page404'),
          },
        ],
      },
      ...(isDevelopment
        ? [
            {
              name: ROUTE_NAMES.PLAYGROUND,
              path: '/__playground__',
              component: () => import('@/views/Playground'),
            },
          ]
        : []),
      {
        name: ROUTE_NAMES.PAGE_404_GLOBAL,
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/Page404'),
      },
    ],
    history: isServer ? createMemoryHistory() : createWebHistory('/'),
  });

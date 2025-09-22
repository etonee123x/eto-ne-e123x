import { createMemoryHistory, createRouter as _createRouter, createWebHistory } from 'vue-router';

import { isServer } from '@/constants/target';
import { isDevelopment } from '@/constants/mode';

export const ROUTE_NAMES = {
  EXPLORER: 'EXPLORER',
  HOME: 'HOME',
  BLOG: 'BLOG',
  BLOG_POST: 'BLOG_POST',
  PLAYGROUND: 'PLAYGROUND',
  PAGE_404_GLOBAL: 'PAGE_404_GLOBAL',
  PAGE_404: 'PAGE_404',
};

export const createRouter = () =>
  _createRouter({
    routes: [
      {
        path: '/:language(ru|en)',
        children: [
          {
            name: ROUTE_NAMES.EXPLORER,
            path: 'explorer/:links(.*)*',
            component: () => import('@/views/Explorer'),
          },
          {
            name: ROUTE_NAMES.HOME,
            path: '',
            redirect: {
              name: ROUTE_NAMES.BLOG,
            },
          },
          {
            path: 'blog',
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

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { ComponentPublicInstance } from 'vue';

  const component: ComponentPublicInstance;

  export default component;
}

declare global {
  var __PLAYER__: unknown;
  var __QUERY__: unknown;
}

// Надо экспортировать что-то, чтобы работало
// eslint-disable-next-line unicorn/require-module-specifiers
export {};

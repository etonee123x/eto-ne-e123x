/// <reference types="vite/client" />

declare module '*.vue' {
  import type { ComponentPublicInstance } from 'vue';

  const component: ComponentPublicInstance;

  export default component;
}

declare module '*.yaml' {
  type Value = string | number | boolean | null | undefined | Record<string, Value> | Array<Value>;

  type ObjectValue = Record<string, Value>;

  const content: ObjectValue;

  export default content;
}

declare global {
  var __GALLERY__: unknown;
  var __PLAYER__: unknown;
  var __QUERY__: unknown;
}

// Надо экспортировать что-то, чтобы работало
// eslint-disable-next-line unicorn/require-module-specifiers
export {};

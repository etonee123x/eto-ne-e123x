import { inject, shallowReactive, type FunctionPlugin, type InjectionKey } from 'vue';

export const INJECTION_KEY_LOADING_SOURCES: InjectionKey<Set<Promise<unknown>>> = Symbol('loadingSources');

export const loadingSources: FunctionPlugin = (app) => {
  const loadingSources = shallowReactive(new Set<Promise<unknown>>());

  app.provide(INJECTION_KEY_LOADING_SOURCES, loadingSources);
};

export const useLoadingSources = () => {
  const loadingSources = inject(INJECTION_KEY_LOADING_SOURCES);

  if (!loadingSources) {
    throw new Error('DialogsIds plugin is not installed');
  }

  return loadingSources;
};

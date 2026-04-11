import { isServer } from '@/constants/target';
import { nonNullable } from '@/utils/nonNullable';
import { inject, shallowRef, watchEffect } from 'vue';
import type { FunctionPlugin, InjectionKey, ShallowRef } from 'vue';

type Context = ShallowRef<Array<string>>;

const INJECTION_KEY: InjectionKey<Context> = Symbol('dialog-ids');

export const dialogsIds: FunctionPlugin = (app) => {
  const ids: Context = shallowRef([]);

  app.provide(INJECTION_KEY, ids);

  watchEffect(() => {
    if (isServer) {
      return;
    }

    if (ids.value.length > 0) {
      document.body.querySelector('#app')?.setAttribute('inert', '');
    } else {
      document.body.querySelector('#app')?.removeAttribute('inert');
    }
  });
};

export const useDialogsIds = () => {
  return nonNullable(inject(INJECTION_KEY));
};

import { nonNullable } from '@/utils/nonNullable';
import { inject } from 'vue';
import type { FunctionPlugin, InjectionKey } from 'vue';

export const INJECTION_KEY_DIALOGS_IDS: InjectionKey<Array<string>> = Symbol('dialogIds');

export const dialogsIds: FunctionPlugin = (app) => {
  app.provide(INJECTION_KEY_DIALOGS_IDS, []);
};

export const useDialogsIds = () => {
  return nonNullable(inject(INJECTION_KEY_DIALOGS_IDS));
};

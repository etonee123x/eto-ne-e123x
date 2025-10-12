import type { Id } from '@etonee123x/shared/helpers/id';
import { inject, type FunctionPlugin, type InjectionKey } from 'vue';

export const INJECTION_KEY_DIALOGS_IDS: InjectionKey<Array<Id>> = Symbol('dialogIds');

export const dialogsIds: FunctionPlugin = (app) => {
  app.provide(INJECTION_KEY_DIALOGS_IDS, []);
};

export const useDialogsIds = () => {
  const dialogsIds = inject(INJECTION_KEY_DIALOGS_IDS);

  if (!dialogsIds) {
    throw new Error('DialogsIds plugin is not installed');
  }

  return dialogsIds;
};

import type { Id } from '@etonee123x/shared/helpers/id';
import { inject, shallowReactive, type InjectionKey, type Plugin } from 'vue';

interface DialogContext {
  onOpen: (id: Id) => void;
  onClose: (id: Id) => void;
  getLastId: () => Id | undefined;
}

const DIALOG_KEY: InjectionKey<DialogContext> = Symbol('dialog');

export const useDialog = () => {
  const dialog = inject(DIALOG_KEY);

  if (!dialog) {
    throw new Error('useDialog must be used within a dialog provider');
  }

  return dialog;
};

export const createDialogPlugin: () => Plugin = () => {
  const idsOpened = shallowReactive<Array<Id>>([]);

  const onOpen = (id: Id) => {
    if (idsOpened.includes(id)) {
      return;
    }

    idsOpened.push(id);
  };

  const getLastId = () => idsOpened.at(-1);

  const onClose = (id: Id) => {
    const index = idsOpened.indexOf(id);

    if (index === -1) {
      return;
    }

    idsOpened.splice(index, 1);
  };

  return {
    install: (app) =>
      app.provide(DIALOG_KEY, {
        onOpen,
        onClose,
        getLastId,
      }),
  };
};

import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import { areIdsEqual, toId, type Id, type WithId } from '@etonee123x/shared/helpers/id';

export const TOAST_TYPES = {
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
} as const;

export interface Toast extends WithId {
  text: string;
  type: (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES];
}

interface Options {
  ttl?: number;
  type: Toast['type'];
}

const DEFAULT_OPTIONS = Object.freeze({
  ttl: 5 * 1000,
});

export const useToastsStore = defineStore('toasts', () => {
  const toasts = reactive<Array<Toast>>([]);

  const toast = (text: string, { ttl = DEFAULT_OPTIONS.ttl, ...options }: Options) => {
    const id = toId(Date.now());

    toasts.push({ text, id, ...options });

    setTimeout(() => closeToast(id), ttl);
  };

  const hasToasts = computed(() => Boolean(toasts.length));

  const toastSuccess = (text: string, options?: Options) => toast(text, { type: TOAST_TYPES.SUCCESS, ...options });

  const toastError = (text: string, options?: Options) => toast(text, { type: TOAST_TYPES.ERROR, ...options });

  const closeToast = (id: Id) => {
    const index = toasts.findIndex(({ id: _id }) => areIdsEqual(_id, id));

    if (index === -1) {
      return;
    }

    toasts.splice(index, 1);
  };

  return {
    toasts,
    hasToasts,

    toastSuccess,
    toastError,
    closeToast,
  };
});

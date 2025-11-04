import { inject, shallowReactive, type FunctionPlugin, type InjectionKey, type ShallowReactive } from 'vue';
import { areIdsEqual, toId, type Id, type WithId } from '@etonee123x/shared/helpers/id';

export const NOTIFICATION_TYPES = {
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
} as const;

export interface Notification extends WithId {
  text: string;
  type: (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
}

interface Notifications {
  notifications: ShallowReactive<Array<Notification>>;
  notify: (text: string, options: { type: Notification['type']; ttl?: number }) => void;
  close: (id: Id) => void;
}

const INJECTION_KEY_NOTIFICATIONS: InjectionKey<Notifications> = Symbol('notifications');

export const notifications: FunctionPlugin = (app) => {
  const notifications = shallowReactive<Array<Notification>>([]);

  const notify: Notifications['notify'] = (text, options) => {
    const id = toId(Date.now());

    notifications.push({ text, id, ...options });

    setTimeout(() => close(id), options.ttl ?? 5 * 1000);
  };

  const close: Notifications['close'] = (id) => {
    const index = notifications.findIndex(({ id: _id }) => areIdsEqual(_id, id));

    if (index === -1) {
      return;
    }

    notifications.splice(index, 1);
  };

  app.provide(INJECTION_KEY_NOTIFICATIONS, {
    notifications,

    notify,
    close,
  });
};

export const useNotifications = () => {
  const notifications = inject(INJECTION_KEY_NOTIFICATIONS);

  if (!notifications) {
    throw new Error('Notifications plugin is not installed');
  }

  return notifications;
};

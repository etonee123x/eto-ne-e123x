<template>
  <ul class="flex flex-col gap-2">
    <li
      v-for="notification in notifications.notifications.slice(0, 5)"
      class="select-none p-2 mx-auto w-fit min-w-[min(20rem,80vw)] bg-background border border-dark rounded-sm hover:scale-[1.02]"
      :class="isSuccess(notification) ? 'text-success' : 'text-error'"
      :key="notification.id"
    >
      <span class="relative flex items-center justify-between gap-2">
        <BaseIcon :path="getIconPath(notification)" />
        <span class="text-text">{{ notification.text }}</span>
        <BaseButton @click="() => onClickClose(notification)">
          <BaseIcon :path="mdiClose" class="text-text" />
        </BaseButton>
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { mdiCheck, mdiClose } from '@mdi/js';

import BaseIcon from '@/components/ui/BaseIcon';
import BaseButton from '@/components/ui/BaseButton';
import { NOTIFICATION_TYPES, useNotifications } from '@/plugins/notifications';
import type { Notification } from '@/plugins/notifications';

const notifications = useNotifications();

const isSuccess = (notification: Notification) => notification.type === NOTIFICATION_TYPES.SUCCESS;

const getIconPath = (notification: Notification) => (isSuccess(notification) ? mdiCheck : mdiClose);

const onClickClose = (notification: Notification) => notifications.close(notification.id);
</script>

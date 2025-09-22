<template>
  <dialog
    :id="String(id)"
    v-bind="$attrs"
    class="dialog"
    :open="model"
    ref="dialog"
    @close="onClose"
    @cancel.prevent="onClose"
  >
    <div class="dialog__backdrop" @click="onClickBackdrop" />
    <div class="dialog__content">
      <slot v-if="!isHiddenHeader" name="header" v-bind="{ close }">
        <header class="flex justify-between items-center mb-6">
          <span v-if="isNotNil(title)" class="text-lg">{{ title }}</span>
          <BaseButton class="ms-auto" @click="onClickCloseIcon">
            <BaseIcon :path="mdiClose" />
          </BaseButton>
        </header>
      </slot>

      <slot v-bind="{ close }" />

      <slot v-if="!isHiddenFooter" name="footer" v-bind="{ close }">
        <footer v-if="buttons.length" class="flex justify-end gap-2 mt-auto">
          <BaseButton v-for="button in buttons" :key="button.key" @click="button.onClick">
            {{ button.text }}
          </BaseButton>
        </footer>
      </slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, useId, useTemplateRef, watchEffect } from 'vue';
import { onKeyDown, useToggle } from '@vueuse/core';
import { mdiClose } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import type { FunctionCallback } from '@etonee123x/shared/types';
import { areIdsEqual, toId } from '@etonee123x/shared/helpers/id';
import BaseButton from './BaseButton';
import BaseIcon from './BaseIcon';
import { useDialogStore } from '@/stores/dialog';
import { isNil } from '@etonee123x/shared/utils/isNil';

const dialog = useTemplateRef('dialog');

const id = useId();

const props = defineProps<
  Partial<{
    title: string;
    buttons: Array<{
      key: PropertyKey;
      text: string;
      onClick: FunctionCallback;
    }>;
    isHiddenHeader: boolean;
    isHiddenFooter: boolean;
  }>
>();

const emit = defineEmits<{
  open: [];
  close: [];
  confirm: [];
  cancel: [];
}>();

const dialogStore = useDialogStore();

const model = defineModel<boolean>();

const toggleModel = useToggle(model);

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      confirm: 'Подтвердить',
      cancel: 'Отмена',
    },
    en: {
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
  },
});

const buttons = computed(
  () =>
    props.buttons ?? [
      {
        key: 'cancel',
        text: t('cancel'),
        onClick: () => {
          emit('cancel');
          close();
        },
      },
      {
        key: 'confirm',
        text: t('confirm'),
        onClick: () => {
          emit('confirm');
          close();
        },
      },
    ],
);

const open = () => {
  if (model.value) {
    return;
  }

  toggleModel(true);

  dialog.value?.showModal();
  emit('open');
};

const close = () => {
  if (!model.value) {
    return;
  }

  toggleModel(false);

  dialog.value?.close();
  emit('close');
};

const onClose = close;
const onClickCloseIcon = close;
const onClickBackdrop = close;

onKeyDown('Escape', () => {
  const maybeLastDialogId = dialogStore.getLastId();

  if (isNil(maybeLastDialogId) || !areIdsEqual(maybeLastDialogId, toId(id))) {
    return;
  }

  close();
});

onBeforeUnmount(() => dialogStore.onClose(toId(id)));

watchEffect(() =>
  model.value //
    ? dialogStore.onOpen(toId(id))
    : dialogStore.onClose(toId(id)),
);

defineExpose({
  open,
  close,
});
</script>

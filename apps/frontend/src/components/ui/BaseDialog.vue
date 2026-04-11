<template>
  <Teleport to="#teleported">
    <dialog
      :id="String(id)"
      v-bind="$attrs"
      class="dialog"
      :open="model"
      ref="dialog"
      @close="onCloseDialog"
      @cancel.prevent="onCloseDialog"
      @click.stop
    >
      <!-- у модалки есть фокус трапа, бэкдроп не сможет сфокуситься, есть escape листенер, вроде ничо плохого... -->
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events vuejs-accessibility/no-static-element-interactions -->
      <div class="dialog__backdrop" @click="onClickBackdrop" />
      <article class="dialog__content">
        <slot v-if="!isHiddenHeader" name="header" v-bind="{ close }">
          <header class="flex justify-between items-center mb-4">
            <h2 v-if="!isNil(title)" class="text-lg">{{ title }}</h2>
            <BaseButton class="ms-auto" @click="onClickCloseIcon">
              <BaseIcon :path="mdiClose" />
            </BaseButton>
          </header>
        </slot>

        <slot v-bind="{ close }" />

        <slot v-if="!isHiddenFooter" name="footer" v-bind="{ close }">
          <footer v-if="buttons.length > 0" class="flex justify-end gap-2 mt-auto">
            <BaseButton v-for="button in buttons" :key="button.key" @click="button.onClick">
              {{ button.text }}
            </BaseButton>
          </footer>
        </slot>
      </article>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, useId, useTemplateRef, watchEffect } from 'vue';
import { onKeyDown, useToggle } from '@vueuse/core';
import { mdiClose } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { useDialogsIds } from '@/plugins/dialogsIds';

const dialog = useTemplateRef('dialog');

const id = useId();

const props = defineProps<
  Partial<{
    title: string;
    buttons: Array<{
      key: PropertyKey;
      text: string;
      onClick: () => void | Promise<void>;
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

const dialogIds = useDialogsIds();

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

const buttons = computed(() => {
  return (
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
    ]
  );
});

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

const onCloseDialog = close;
const onClickCloseIcon = close;
const onClickBackdrop = close;

const onOpen = (id: string) => {
  if (dialogIds.value.includes(id)) {
    return;
  }

  dialogIds.value = [...dialogIds.value, id];
};

const onClose = (id: string) => {
  const index = dialogIds.value.indexOf(id);

  if (index === -1) {
    return;
  }

  dialogIds.value = dialogIds.value.toSpliced(index, 1);
};

onKeyDown('Escape', () => {
  const maybeLastDialogId = dialogIds.value.at(-1);

  if (isNil(maybeLastDialogId) || maybeLastDialogId !== id) {
    return;
  }

  close();
});

onBeforeUnmount(() => {
  onClose(id);
});

watchEffect(() => {
  if (model.value) {
    onOpen(id);
  } else {
    onClose(id);
  }
});

defineExpose({
  open,
  close,
});
</script>

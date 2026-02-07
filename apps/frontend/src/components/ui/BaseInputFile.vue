<template>
  <div>
    <button type="button" :class="INPUT.default" @click="onClick">
      <input tabindex="-1" class="fixed start-0 translate-x-[-200%] pointer-events-none" type="file" />
      <BaseIcon :path="mdiFilePlusOutline" />
    </button>
    <BaseDialog :title="t('title')" ref="baseDialog" @confirm="onConfirm" @close="onClose" @click.stop>
      <LazyBaseFilesList v-if="model.length > 0" v-model="model" />
      <BaseButton class="mx-auto my-4" :propsIconPrepend="{ path: mdiPlus }" @click="onClickAdd">
        {{ t('add') }}
      </BaseButton>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, useTemplateRef } from 'vue';
import { useFileDialog } from '@vueuse/core';
import { mdiFilePlusOutline, mdiPlus } from '@mdi/js';
import { useI18n } from 'vue-i18n';

import BaseButton from '@/components/ui/BaseButton.vue';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import BaseDialog from '@/components/ui/BaseDialog.vue';

import { INPUT } from '@/helpers/ui';
import { fileToFileWithHashName } from '@/helpers/fileToFileWithHashName';

const LazyBaseFilesList = defineAsyncComponent(() => {
  return import('./BaseFilesList.vue');
});

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      title: 'Файлы',
      add: 'Добавить',
    },
    en: {
      title: 'Files',
      add: 'Add',
    },
  },
});

const baseDialog = useTemplateRef('baseDialog');

const fileDialogInitial = useFileDialog();

fileDialogInitial.onChange((files) => {
  if (!files) {
    return;
  }

  model.value = [...files].map((file) => {
    return fileToFileWithHashName(file);
  });

  baseDialog.value?.open();
  fileDialogInitial.reset();
});

const fileDialogInModal = useFileDialog();

const model = ref<Array<File>>([]);

const emit = defineEmits<{
  'update:modelValue': [Array<File>];
}>();

const onClick = () => {
  fileDialogInitial.open();
};

const onClickAdd = () => {
  fileDialogInModal.open();
};

fileDialogInModal.onChange((files) => {
  if (!files) {
    return;
  }

  [...files]
    .map((file) => {
      return fileToFileWithHashName(file);
    })
    .forEach((file) => {
      model.value.push(file);
    });

  fileDialogInModal.reset();
});

const onConfirm = () => {
  emit('update:modelValue', model.value);
};

const onClose = () => {
  model.value = [];
};
</script>

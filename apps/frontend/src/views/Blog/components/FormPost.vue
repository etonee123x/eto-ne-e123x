<template>
  <form class="flex gap-4 flex-col" ref="form" @submit.prevent="onSubmit">
    <div class="flex gap-4">
      <textarea
        :placeholder="t('textareaPlaceholder')"
        name="text"
        class="rounded-lg border border-neutral-700 dark:bg-neutral-950 focus:border-primary-500 overflow-hidden w-full m-0 p-4 resize-none flex bg-none flex-1"
        ref="textarea"
        v-model="resetableRefPostModel.value.value.text"
        @keydown.enter="onKeyDownEnter"
        @paste="onPaste"
      />
      <div class="sticky top-2 flex flex-col gap-2 h-min">
        <BaseButton type="button" class="p-4" @click="onClickButtonAddFile">
          <BaseIcon class="size-8" :path="mdiFilePlusOutline" />
        </BaseButton>
      </div>
    </div>
    <div v-if="resetableRefFilesAndAttachments.value.value.length > 0">
      <div class="mb-3 flex items-center gap-2">
        <div class="text-xl">{{ t('files') }}</div>
        <BaseButton type="button" @click="onClickDeleteFiles">
          <BaseIcon :path="mdiClose" />
        </BaseButton>
      </div>
      <LazyBaseFilesList v-model="resetableRefFilesAndAttachments.value.value" />
    </div>

    <slot />

    <DialogInputFile ref="dialogInputFile" @update:modelValue="onUpdateModelValueDialogInputFile" />
  </form>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, defineAsyncComponent, toRef, useTemplateRef } from 'vue';
import { mdiClose, mdiFilePlusOutline } from '@mdi/js';

import BaseButton from '@/components/ui/BaseButton.vue';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import { useResetableRef } from '@/composables/useResetableRef';
import { useIsMobile } from '@/composables/useIsMobile';
import type { components } from '@/types/openapi';
import { isFile } from '@/utils/isFile';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { fileToFileWithHashName } from '@/helpers/fileToFileWithHashName';
import DialogInputFile from '@/components/DialogInputFile.vue';
import { useTextareaAutosize } from '@vueuse/core';

const dialogInputFile = useTemplateRef('dialogInputFile');

type Post = Omit<components['schemas']['PostUpdateRequest'], 'files'>;

const props = defineProps<{
  post: Post;
}>();

const emit = defineEmits<{
  submit: [post: Post, files: Array<File>];
}>();

const form = useTemplateRef('form');

const LazyBaseFilesList = defineAsyncComponent(() => {
  return import('@/components/ui/BaseFilesList.vue');
});

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      textareaPlaceholder: 'Сообщение',
      files: 'Файлы',
      required: 'Обязательное',
    },
    en: {
      textareaPlaceholder: 'Message',
      files: 'Files',
      required: 'Required',
    },
  },
});

const resetableRefFilesAndAttachments = useResetableRef<Array<NonNullable<Post['attachments'][number]> | File>>(() => {
  return props.post.attachments.filter((attachment) => {
    return !isNil(attachment);
  });
});
const onClickDeleteFiles = resetableRefFilesAndAttachments.reset;

const resetableRefPostModel = useResetableRef<Post>(() => {
  return props.post;
});

const { textarea } = useTextareaAutosize({
  input: toRef(resetableRefPostModel.value.value, 'text'),
  styleProp: 'minHeight',
});

const isMobile = useIsMobile();

const onKeyDownEnter = (event: KeyboardEvent) => {
  if (isMobile) {
    return;
  }

  if (event.shiftKey || event.ctrlKey) {
    return;
  }

  event.preventDefault();

  form.value?.requestSubmit();
};

const onPaste: HTMLTextAreaElement['onpaste'] = (event) => {
  const maybeFileList = event.clipboardData?.files;

  if (!maybeFileList?.length) {
    return;
  }

  event.preventDefault();
  resetableRefFilesAndAttachments.value.value = [
    ...resetableRefFilesAndAttachments.value.value,
    ...[...maybeFileList].map((file) => {
      return fileToFileWithHashName(file);
    }),
  ];
};

const onUpdateModelValueDialogInputFile: InstanceType<typeof DialogInputFile>['onUpdate:modelValue'] = (_files) => {
  resetableRefFilesAndAttachments.value.value = [...resetableRefFilesAndAttachments.value.value, ..._files];
};

const focusTextarea = () => {
  textarea.value?.focus();
};

const onSubmit = async () => {
  emit(
    'submit',
    {
      text: resetableRefPostModel.value.value.text,
      attachments: resetableRefFilesAndAttachments.value.value.map((fileOrAttachment) => {
        return isFile(fileOrAttachment) ? null : fileOrAttachment;
      }),
    },
    resetableRefFilesAndAttachments.value.value.filter((fileOrAttachment) => {
      return isFile(fileOrAttachment);
    }),
  );

  resetableRefFilesAndAttachments.reset();
  resetableRefPostModel.reset();

  focusTextarea();
};

const onClickButtonAddFile = () => {
  dialogInputFile.value?.open();
};

defineExpose({
  focusTextarea,
  form,
  isValid: computed(() => {
    return (
      resetableRefPostModel.value.value.text.trim().length > 0 ||
      resetableRefFilesAndAttachments.value.value.length > 0 ||
      resetableRefPostModel.value.value.attachments.length > 0
    );
  }),
});
</script>

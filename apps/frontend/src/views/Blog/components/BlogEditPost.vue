<template>
  <BaseForm class="flex gap-4 flex-col" ref="baseForm" @submit.prevent="onSubmit">
    <div class="flex gap-4">
      <BaseTextarea
        class="flex-1"
        :placeholder="t('textareaPlaceholder')"
        :errors="v$.text.$errors"
        ref="baseTextarea"
        v-model="postData.text"
        @keydown:enter="onKeyDownEnter"
        @paste="onPaste"
      />
      <div class="sticky top-2 flex flex-col gap-2 h-min">
        <BaseInputFile @update:modelValue="onUpdateModelValueInputFile" />
      </div>
    </div>
    <div v-if="files.length > 0">
      <div class="mb-3 flex items-center gap-2">
        <div class="text-xl">{{ t('files') }}</div>
        <BaseButton @click="onClickDeleteFiles">
          <BaseIcon :path="mdiDelete" />
        </BaseButton>
      </div>
      <LazyBaseFilesList v-model="files" />
    </div>

    <slot />
  </BaseForm>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { defineAsyncComponent, useTemplateRef } from 'vue';
import type { Post } from '@etonee123x/shared/types/blog';
import { mdiDelete } from '@mdi/js';

import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseInputFile from '@/components/ui/BaseInputFile.vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import BaseIcon from '@/components/ui/BaseIcon';
import type { ForPost } from '@etonee123x/shared/types/database';
import BaseForm from '@/components/ui/BaseForm.vue';
import { useSourcedRef } from '@/composables/useSourcedRef';
import { useIsMobile } from '@/composables/useIsMobile';
import { helpers, requiredIf } from '@vuelidate/validators';
import { i18n } from '@/i18n';
import useVuelidate from '@vuelidate/core';

const props = defineProps<{
  post?: ForPost<Post>;
}>();

const emit = defineEmits<{
  submit: [post: ForPost<Post>, files: Array<File>];
}>();

const baseForm = useTemplateRef('baseForm');

const LazyBaseFilesList = defineAsyncComponent(() => import('@/components/ui/BaseFilesList.vue'));

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      textareaPlaceholder: 'Сообщение',
      files: 'Файлы',
    },
    en: {
      textareaPlaceholder: 'Message',
      files: 'Files',
    },
  },
});

const baseTextarea = useTemplateRef('baseTextarea');

const onClickDeleteFiles = () => {
  files.value = [];
};

const [files, resetFiles] = useSourcedRef<Array<File>>([]);

const [postData, resetPostModel] = useSourcedRef<ForPost<Post>>(
  () =>
    props.post ?? {
      text: '',
      filesUrls: [],
    },
);

const v$ = useVuelidate(
  {
    text: {
      requiredIfNoFiles: helpers.withMessage(
        () => i18n.global.t('validations.required'),
        requiredIf(() => files.value.length === 0 && postData.value.filesUrls.length === 0),
      ),
    },
  },
  postData,
  { $lazy: true },
);

const isMobile = useIsMobile();

const onKeyDownEnter: InstanceType<typeof BaseTextarea>['onKeydown:enter'] = (event: KeyboardEvent) => {
  if (isMobile) {
    return;
  }

  if (event.shiftKey || event.ctrlKey) {
    return;
  }

  event.preventDefault();

  baseForm.value?.requestSubmit();
};

const onPaste: InstanceType<typeof BaseTextarea>['onPaste'] = (event) => {
  const maybeFileList = event.clipboardData?.files;

  if (!maybeFileList?.length) {
    return;
  }

  event.preventDefault();
  files.value = [...files.value, ...maybeFileList];
};

const onUpdateModelValueInputFile: InstanceType<typeof BaseInputFile>['onUpdate:model-value'] = (_files) => {
  files.value = [...files.value, ..._files];
};

const focusTextarea = () => baseTextarea.value?.focus();

const onSubmit = async () => {
  if (!(await v$.value.$validate())) {
    return;
  }

  emit('submit', postData.value, files.value);

  resetFiles();
  resetPostModel();
  v$.value.$reset();

  focusTextarea();
};

defineExpose({
  focusTextarea,
  postData,
  requestSubmit: () => baseForm.value?.requestSubmit(),
});
</script>

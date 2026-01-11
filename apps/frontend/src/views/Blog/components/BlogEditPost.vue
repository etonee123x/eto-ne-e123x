<template>
  <BaseForm class="flex gap-4 flex-col" ref="baseForm" @submit.prevent="onSubmit">
    <div class="flex gap-4">
      <BaseTextarea
        class="flex-1"
        :placeholder="t('textareaPlaceholder')"
        :errors="v$.text.$errors"
        ref="baseTextarea"
        v-model="resetableRefPostModel.value.value.text"
        @keydown:enter="onKeyDownEnter"
        @paste="onPaste"
      />
      <div class="sticky top-2 flex flex-col gap-2 h-min">
        <BaseInputFile @update:modelValue="onUpdateModelValueInputFile" />
      </div>
    </div>
    <div v-if="resetableRefFiles.value.value.length > 0">
      <div class="mb-3 flex items-center gap-2">
        <div class="text-xl">{{ t('files') }}</div>
        <BaseButton @click="onClickDeleteFiles">
          <BaseIcon :path="mdiDelete" />
        </BaseButton>
      </div>
      <LazyBaseFilesList v-model="resetableRefFiles.value.value" />
    </div>

    <slot />
  </BaseForm>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { defineAsyncComponent, useTemplateRef } from 'vue';
import { mdiDelete } from '@mdi/js';

import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseInputFile from '@/components/ui/BaseInputFile.vue';
import BaseButton from '@/components/ui/BaseButton/BaseButton.vue';
import BaseIcon from '@/components/ui/BaseIcon';
import BaseForm from '@/components/ui/BaseForm.vue';
import { useResetableRef } from '@/composables/useResetableRef';
import { useIsMobile } from '@/composables/useIsMobile';
import { helpers, requiredIf } from '@vuelidate/validators';
import { i18n } from '@/i18n';
import useVuelidate from '@vuelidate/core';
import type { components } from '@/types/openapi';

type Post = Omit<components['schemas']['PostResponse'], '_meta'>;

const props = defineProps<{
  post?: Post;
}>();

const emit = defineEmits<{
  submit: [post: Post, files: Array<File>];
}>();

const baseForm = useTemplateRef('baseForm');

const LazyBaseFilesList = defineAsyncComponent(() => {
  return import('@/components/ui/BaseFilesList.vue');
});

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

const resetableRefFiles = useResetableRef<Array<File>>([]);
const onClickDeleteFiles = resetableRefFiles.reset;

const resetableRefPostModel = useResetableRef<Post>(() => {
  return (
    props.post ?? {
      text: '',
      attachments: [],
      attachmentsOrder: [],
    }
  );
});

const v$ = useVuelidate(
  {
    text: {
      requiredIfNoFiles: helpers.withMessage(
        () => {
          return i18n.global.t('validations.required');
        },
        requiredIf(() => {
          return resetableRefFiles.value.value.length === 0 && resetableRefPostModel.value.value.text.length === 0;
        }),
      ),
    },
  },
  resetableRefPostModel.value,
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
  resetableRefFiles.value.value = [...resetableRefFiles.value.value, ...maybeFileList];
};

const onUpdateModelValueInputFile: InstanceType<typeof BaseInputFile>['onUpdate:modelValue'] = (_files) => {
  resetableRefFiles.value.value = [...resetableRefFiles.value.value, ..._files];
};

const focusTextarea = () => {
  return baseTextarea.value?.focus();
};

const onSubmit = async () => {
  if (!(await v$.value.$validate())) {
    return;
  }

  emit('submit', resetableRefPostModel.value.value, resetableRefFiles.value.value);

  resetableRefFiles.reset();
  resetableRefPostModel.reset();
  v$.value.$reset();

  focusTextarea();
};

defineExpose({
  focusTextarea,
  resetableRefPostModel,
  requestSubmit: () => {
    return baseForm.value?.requestSubmit();
  },
});
</script>

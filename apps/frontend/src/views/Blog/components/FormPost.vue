<template>
  <form class="flex gap-4 flex-col" ref="form" @submit.prevent="onSubmit">
    <div class="flex gap-4">
      <BaseTextarea
        class="flex-1"
        :placeholder="t('textareaPlaceholder')"
        name="text"
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
  </form>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, defineAsyncComponent, useTemplateRef } from 'vue';
import { mdiDelete } from '@mdi/js';

import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseInputFile from '@/components/ui/BaseInputFile.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import { useResetableRef } from '@/composables/useResetableRef';
import { useIsMobile } from '@/composables/useIsMobile';
import type { components } from '@/types/openapi';

type Post = Omit<components['schemas']['PostResponse'], '_meta'>;

const props = defineProps<{
  post?: Post;
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

const baseTextarea = useTemplateRef('baseTextarea');

const resetableRefFiles = useResetableRef<Array<File>>([]);
const onClickDeleteFiles = resetableRefFiles.reset;

const resetableRefPostModel = useResetableRef<Post>(() => {
  return (
    props.post ?? {
      text: '',
      attachments: [],
    }
  );
});

const isMobile = useIsMobile();

const onKeyDownEnter: InstanceType<typeof BaseTextarea>['onKeydown:enter'] = (event: KeyboardEvent) => {
  if (isMobile) {
    return;
  }

  if (event.shiftKey || event.ctrlKey) {
    return;
  }

  event.preventDefault();

  form.value?.requestSubmit();
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
  baseTextarea.value?.focus();
};

const onSubmit = async () => {
  emit('submit', resetableRefPostModel.value.value, resetableRefFiles.value.value);

  resetableRefFiles.reset();
  resetableRefPostModel.reset();

  focusTextarea();
};

defineExpose({
  focusTextarea,
  form,
  isValid: computed(() => {
    return (
      resetableRefPostModel.value.value.text.trim().length > 0 ||
      resetableRefFiles.value.value.length > 0 ||
      resetableRefPostModel.value.value.attachments.length > 0
    );
  }),
});
</script>

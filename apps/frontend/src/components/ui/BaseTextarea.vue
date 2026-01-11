<template>
  <div class="flex flex-col gap-1">
    <textarea
      class="rounded-lg border border-dark overflow-hidden w-full m-0 p-4 resize-none flex bg-none flex-1 placeholder:text-dark focus:on-focus"
      :placeholder
      ref="textarea"
      v-model="model"
      @paste="onPaste"
      @keydown.enter="onKeyDownEnter"
    />
    <ul v-if="errors.length > 0" class="text-sm flex flex-col gap-1 text-error">
      <li v-for="error in errors" :key="error.$uid">{{ error.$message }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { ErrorObject } from '@vuelidate/core';
import { useTextareaAutosize } from '@vueuse/core';

withDefaults(
  defineProps<{
    placeholder?: string;
    errors?: Array<ErrorObject>;
  }>(),
  {
    placeholder: undefined,
    errors: () => {
      return [];
    },
  },
);

const emit = defineEmits<{
  paste: [ClipboardEvent];
  drop: [DragEvent];
  'keydown:enter': [KeyboardEvent];
}>();

const onPaste = (event: ClipboardEvent) => {
  emit('paste', event);
};

const onKeyDownEnter = (event: KeyboardEvent) => {
  emit('keydown:enter', event);
};

const model = defineModel<string>({ required: true });

const { textarea } = useTextareaAutosize({ input: model, styleProp: 'minHeight' });

defineExpose({
  focus: () => {
    return textarea.value?.focus();
  },
});
</script>

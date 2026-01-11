<template>
  <div class="flex flex-col" :class="hasError ? 'group has-error text-error' : 'text-primary-800'">
    <label v-if="label" :class="ELEMENT_TITLE" :for="labelFor" class="mb-1">{{ label }}</label>
    <slot />
    <div class="flex mt-1 h-3 gap-2 items-center text-3xs text-black group-[.has-error]:text-error">
      <slot name="bottom">
        {{ maybeMessage }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ELEMENT_TITLE } from '@/helpers/ui';
import { isNil } from '@etonee123x/shared/utils/isNil';

const props = defineProps<
  Partial<{
    labelFor: HTMLLabelElement['htmlFor'];
    errorMessage: string;
    message: string;
    label: string;
  }>
>();

const hasError = computed(() => {
  return !isNil(props.errorMessage);
});

const maybeMessage = computed(() => {
  return props.errorMessage ?? props.message;
});
</script>

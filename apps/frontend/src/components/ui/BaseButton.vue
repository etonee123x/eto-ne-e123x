<template>
  <button :class="BUTTON.default" :disabled>
    <span class="flex justify-between items-center gap-1" :class="isLoading && 'opacity-20'">
      <span v-if="$slots.prepend || propsIconPrepend" class="flex">
        <slot name="prepend">
          <BaseIcon v-if="propsIconPrepend" v-bind="propsIconPrepend" />
        </slot>
      </span>
      <slot />
      <span v-if="$slots.append || propsIconAppend" class="flex">
        <slot name="append">
          <BaseIcon v-if="propsIconAppend" v-bind="propsIconAppend" />
        </slot>
      </span>
    </span>
    <LazyBaseLoading v-if="isLoading" class="absolute left-1/2" />
  </button>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { BUTTON } from '@/helpers/ui';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import type { Props as PropsBaseIcon } from '@/components/ui/BaseIcon.vue';

const LazyBaseLoading = defineAsyncComponent(() => {
  return import('@/components/ui/BaseLoading.vue');
});

const props = defineProps<
  Partial<{
    disabled: boolean;
    isLoading: boolean;
    propsIconPrepend: PropsBaseIcon;
    propsIconAppend: PropsBaseIcon;
  }>
>();

const disabled = computed(() => {
  return props.disabled || props.isLoading;
});
</script>

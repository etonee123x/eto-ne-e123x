<template>
  <div class="overflow-hidden relative inline-flex" ref="container">
    <div
      :style="{
        '--scroll-x-diff': diffFormatted,
        '--scroll-x-duration': duration,
      }"
      class="whitespace-nowrap m-[var(--base-always-scrollable--content--margin)]"
      :class="isAnimated && 'animate-scroll-x [animation-duration:var(--scroll-x-duration)]'"
      ref="content"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { computed, useTemplateRef } from 'vue';

withDefaults(
  defineProps<
    Partial<{
      duration: string;
    }>
  >(),
  {
    duration: '5000ms',
  },
);

const container = useTemplateRef('container');
const content = useTemplateRef('content');

const { width: widthContainer } = useElementSize(container, undefined, { box: 'border-box' });
const { width: widthContent } = useElementSize(content, undefined, { box: 'border-box' });

const diff = computed(() => widthContent.value - widthContainer.value);

const diffFormatted = computed(() => `-${diff.value}px`);

const isAnimated = computed(() => diff.value > 0);
</script>

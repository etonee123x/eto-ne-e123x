<template>
  <div class="layout-container py-2">
    <header class="mb-2">
      <h1 class="text-3xl font-semibold">{{ h1 }}</h1>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';

const props = defineProps<{
  h1: string;
}>();

useHead(
  {
    title: () => {
      return props.h1;
    },
  },
  { tagPriority: 'low' },
);
</script>

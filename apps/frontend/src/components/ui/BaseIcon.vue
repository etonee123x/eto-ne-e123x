<template>
  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
    <path :d="path" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
export interface Props {
  path: string;
}

defineProps<Props>();
</script>

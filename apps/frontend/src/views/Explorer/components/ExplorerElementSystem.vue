<template>
  <component :is="tag" class="explorer-element">
    <h2 class="explorer-element__title">
      <slot />
    </h2>
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tag?: string;
  }>(),
  {
    tag: 'div',
  },
);
</script>

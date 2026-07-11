<template>
  <RouterLink :to class="explorer-element explorer-element_folder">
    <h2 class="explorer-element__title w-2/3 overflow-x-auto overflow-y-hidden p-2">
      {{ element.name }}
    </h2>
  </RouterLink>
</template>

<script setup lang="ts">
import type { components } from '@/types/openapi';
import type { RouterLinkProps } from 'vue-router';

defineProps<{
  element: components['schemas']['FolderDataItemFolder'];
  to: RouterLinkProps['to'];
}>();
</script>

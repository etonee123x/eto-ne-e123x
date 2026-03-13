<template>
  <ElementFileWrapper :to :element>
    <img
      class="max-w-full mx-auto"
      :width="element.metadata.width"
      :height="element.metadata.height"
      :src="element.src"
      :alt="element.name"
    />
  </ElementFileWrapper>
</template>

<script setup lang="ts">
import ElementFileWrapper from './_ElementFileWrapper.vue';
import type { Props as PropsElementFileWrapper } from './_ElementFileWrapper.vue';
import type { components } from '@/types/openapi';

defineProps<{
  element: components['schemas']['FolderDataItemImage'];
  to: PropsElementFileWrapper['to'];
}>();
</script>

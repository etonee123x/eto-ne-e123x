<template>
  <ElementFileWrapper :to :element>
    <template #default="props">
      <div :class="props.class">
        <BaseVideoPreview
          class="mx-auto"
          :src="element.src"
          :width="element.metadata.width"
          :height="element.metadata.height"
        />
      </div>
    </template>
  </ElementFileWrapper>
</template>

<script setup lang="ts">
import type { components } from '@/types/openapi';
import ElementFileWrapper from './_ElementFileWrapper.vue';
import type { Props as PropsElementFileWrapper } from './_ElementFileWrapper.vue';

import BaseVideoPreview from '@/components/ui/BaseVideoPreview.vue';

defineProps<{
  element: components['schemas']['FolderDataItemVideo'];
  to: PropsElementFileWrapper['to'];
}>();
</script>

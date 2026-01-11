<template>
  <ElementFileWrapper :to :element>
    <PreviewVideo :src="element.src" />
  </ElementFileWrapper>
</template>

<script setup lang="ts">
import type { components } from '@/types/openapi';
import ElementFileWrapper from './_ElementFileWrapper.vue';
import type { Props as PropsElementFileWrapper } from './_ElementFileWrapper.vue';

import PreviewVideo from '@/components/PreviewVideo.vue';

defineProps<{
  element: components['schemas']['FolderDataItemVideo'];
  to: PropsElementFileWrapper['to'];
}>();
</script>

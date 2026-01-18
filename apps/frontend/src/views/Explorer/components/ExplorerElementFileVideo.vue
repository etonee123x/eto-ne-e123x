<template>
  <ElementFileWrapper :to :element>
    <BaseVideo :src="element.src" />
  </ElementFileWrapper>
</template>

<script setup lang="ts">
import type { components } from '@/types/openapi';
import ElementFileWrapper from './_ElementFileWrapper.vue';
import type { Props as PropsElementFileWrapper } from './_ElementFileWrapper.vue';

import BaseVideo from '@/components/ui/BaseVideo.vue';

defineProps<{
  element: components['schemas']['FolderDataItemVideo'];
  to: PropsElementFileWrapper['to'];
}>();
</script>

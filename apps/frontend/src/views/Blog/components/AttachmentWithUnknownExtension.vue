<template>
  <a :href="attachment.src" target="_blank" class="inline-flex items-end gap-0.5" @click.stop>
    <BaseIcon :path="mdiFileOutline" class="text-2xl" />
    <BaseAlwaysScrollable class="flex-1" duration="12000ms">
      {{ attachment.name }}
    </BaseAlwaysScrollable>
  </a>
</template>

<script setup lang="ts">
import { mdiFileOutline } from '@mdi/js';

import BaseIcon from '@/components/ui/BaseIcon';
import BaseAlwaysScrollable from '@/components/ui/BaseAlwaysScrollable.vue';
import type { components } from '@/types/openapi';

defineProps<{
  attachment: components['schemas']['PostAttachment'] & components['schemas']['FolderDataItemUnknown'];
}>();
</script>

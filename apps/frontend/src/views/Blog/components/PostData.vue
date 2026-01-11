<template>
  <div class="flex flex-col gap-4">
    <BaseHtml v-if="html" :html />
    <ul v-if="post.attachments.length > 0">
      <li v-for="(attachment, index) in post.attachments" :key="index">
        <PostDataAttachment :attachment :index />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import PostDataAttachment from './PostDataAttachment.vue';

import BaseHtml from '@/components/ui/BaseHtml.vue';
import { parseContent } from '@/utils/parseContent';
import type { components } from '@/types/openapi';

const props = defineProps<{
  post: components['schemas']['PostResponse'];
}>();

const html = computed(() => {
  return parseContent(props.post.text);
});
</script>

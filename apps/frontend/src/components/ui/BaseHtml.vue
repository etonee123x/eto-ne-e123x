<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="custom-html" ref="root" v-html="html" />
</template>

<script setup lang="ts">
// TODO: add sanitization
import { onMounted, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

defineProps<{
  html: string;
}>();

const root = useTemplateRef('root');

const router = useRouter();

onMounted(() => {
  [...(root.value?.getElementsByTagName('a') ?? [])].forEach((a) => {
    return a.addEventListener('click', (event) => {
      const hasHref = event.target && 'href' in event.target && typeof event.target.href === 'string';
      const hasTargetBlank = event.target && 'target' in event.target && event.target.target === '_blank';

      if (!hasHref || hasTargetBlank) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();

      router.push(String(event.target.href).replace(globalThis.origin, ''));
    });
  });
});
</script>

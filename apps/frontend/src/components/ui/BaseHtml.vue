<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="custom-html" @click="onClick" v-html="html" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineProps<{
  html: string;
}>();

const router = useRouter();

const onClick = (event: Event) => {
  const target = event.target;

  if (!(target instanceof HTMLAnchorElement)) {
    return;
  }

  if (!target.href || target.target === '_blank') {
    return;
  }

  event.stopPropagation();
  event.preventDefault();

  router.push(target.href.replace(globalThis.origin, ''));
};
</script>

<template>
  <div class="flex justify-center items-center max-w-full relative">
    <video class="max-w-full" :src :width :height :onClick />
    <BaseIcon class="absolute text-items size-1/3 pointer-events-none" :path="mdiPlayCircleOutline" />
  </div>
</template>

<script setup lang="ts">
import { mdiPlayCircleOutline } from '@mdi/js';
import BaseIcon from '@/components/ui/BaseIcon.vue';

defineProps<
  Partial<{
    src: HTMLVideoElement['src'];
    width: HTMLVideoElement['width'];
    height: HTMLVideoElement['height'];
    onClick: NonNullable<HTMLVideoElement['onclick']>;
  }>
>();
</script>

<template>
  <BaseButton :class="model && 'text-primary-500 border-primary-500'" @click="onClick">
    <slot />
  </BaseButton>
</template>

<script setup lang="ts">
import { useToggle } from '@vueuse/core';

import BaseButton from './BaseButton';

const model = defineModel<boolean>();

const toggle = useToggle(model);

const onClick = () => toggle();
</script>

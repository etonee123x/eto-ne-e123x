<template>
  <BaseButton
    :style="
      model && {
        '--button-color': 'white',
        '--button-border-color': 'currentColor',
        '--button-background-color': 'var(--color-primary-800)',
        '--button-hover-background-color': 'var(--color-primary-900)',
      }
    "
    @click="onClick"
  >
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

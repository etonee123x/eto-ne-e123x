<template>
  <div
    :style
    class="touch-pan-x"
    ref="root"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchCancel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, useTemplateRef } from 'vue';
import type { CSSProperties } from 'vue';
import { useElementSize } from '@vueuse/core';

const props = withDefaults(
  defineProps<
    Partial<{
      threshold: number | `${number}`;
      disapearDelay: number | `${number}`;
    }>
  >(),
  {
    threshold: 0.25,
    disapearDelay: 300,
  },
);

const emit = defineEmits<{
  swiped: [];
}>();

const root = useTemplateRef('root');

const { width } = useElementSize(root, undefined, { box: 'border-box' });

const threshold = computed(() => {
  return width.value * Number(props.threshold);
});

let touchStartX = 0;
let diff = 0;
let wasStarted = false;

const style = reactive<CSSProperties>({});

const onTouchStart = (event: TouchEvent) => {
  const maybeChangedTouch = event.changedTouches[0];

  if (!maybeChangedTouch) {
    return;
  }

  wasStarted = true;
  touchStartX = maybeChangedTouch.screenX;
  style.transition = 'all 0ms';
};

const onTouchMove = (event: TouchEvent) => {
  const maybeTouch = event.touches[0];

  if (!(wasStarted && maybeTouch)) {
    return;
  }

  diff = maybeTouch.screenX - touchStartX;
  style.transform = `translateX(${diff}px)`;
};

const onTouchEnd = () => {
  wasStarted = false;

  const wasSwipedLeft = diff < -threshold.value;
  const wasSwipedRight = diff > threshold.value;

  if (!(wasSwipedLeft || wasSwipedRight)) {
    style.transition = 'all 500ms';
    style.transform = `translateX(0px)`;

    return;
  }

  style.transition = `all ${props.disapearDelay}ms`;
  style.transform = `translateX(${globalThis.innerWidth * (wasSwipedLeft ? -1 : 1)}px)`;

  setTimeout(() => {
    emit('swiped');
  }, Number(props.disapearDelay));
};

const onTouchCancel = () => {
  wasStarted = false;
  style.transition = 'all 500ms';
  style.transform = `translateX(0px)`;
};
</script>

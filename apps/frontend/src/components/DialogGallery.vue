<template>
  <BaseDialog v-if="cycleList.state" isHiddenFooter v-model="isDialogOpen">
    <template #header="context">
      <header class="flex gap-2 mb-4">
        <BaseAlwaysScrollable class="w-full [--base-always-scrollable--content--margin:0_auto]" duration="12000ms">
          {{ cycleList.state.name }}
        </BaseAlwaysScrollable>
        <BaseButton class="ms-auto" @click="context.close">
          <BaseIcon :path="mdiClose" />
        </BaseButton>
      </header>
    </template>
    <component
      :is="component.is"
      v-bind="component.binds"
      class="object-contain border-none max-w-full max-h-[calc(90dvh-2*4*var(--spacing)-6*var(--spacing)-2*var(--spacing))]"
      :src="cycleList.state.src"
      :height="cycleList.state.metadata.height"
      :width="cycleList.state.metadata.width"
    />
  </BaseDialog>
</template>

<script lang="ts" setup>
import { onKeyStroke, useCycleList, useSwipe, useToggle } from '@vueuse/core';
import { computed, reactive, useTemplateRef, watchEffect } from 'vue';

import BaseAlwaysScrollable from '@/components/ui/BaseAlwaysScrollable.vue';
import BaseDialog from '@/components/ui/BaseDialog.vue';
import { FILE_TYPES } from '@/helpers/folderData';
import type { components } from '@/types/openapi';
import BaseButton from './ui/BaseButton.vue';
import { mdiClose } from '@mdi/js';
import BaseIcon from './ui/BaseIcon.vue';

type Item = components['schemas']['FolderDataItemImage'] | components['schemas']['FolderDataItemVideo'];

const props = defineProps<{
  item?: Item;
  items: Array<Item>;
}>();

const cycleList = reactive(
  useCycleList<Item | undefined>(
    () => {
      return props.items;
    },
    {
      getIndexOf: (item, list) => {
        return list.findIndex((_item) => {
          return _item?.src === item?.src;
        });
      },
      initialValue: computed(() => {
        return props.item;
      }),
    },
  ),
);

onKeyStroke('ArrowRight', () => {
  cycleList.next();
});
onKeyStroke('ArrowLeft', () => {
  cycleList.prev();
});

const mediaContainer = useTemplateRef('mediaContainer');

const component = computed(() => {
  return cycleList.state?.fileType === FILE_TYPES.VIDEO
    ? {
        is: 'video',
        binds: {
          autoplay: true,
          controls: true,
        },
      }
    : {
        is: 'img',
      };
});

useSwipe(mediaContainer, {
  onSwipeEnd: (...[, direction]) => {
    if (direction === 'right') {
      cycleList.prev();
    } else if (direction === 'left') {
      cycleList.next();
    }
  },
});

const hasItem = computed(() => {
  return Boolean(props.item);
});

const [isDialogOpen, toggleIsDialogOpen] = useToggle(hasItem.value);

watchEffect(() => {
  return toggleIsDialogOpen(hasItem.value);
});

// useSeoMeta({
//   ogImage: () => {
//     if (!gallery.item.value) {
//       return;
//     }

//     if (gallery.item.value.fileType !== FILE_TYPES.IMAGE) {
//       return;
//     }

//     return {
//       url: gallery.item.value.src,
//       width: gallery.item.value.metadata.width,
//       height: gallery.item.value.metadata.height,
//       alt: gallery.item.value.name,
//     };
//   },
//   ogVideo: () => {
//     if (!gallery.item.value) {
//       return;
//     }

//     if (gallery.item.value.fileType !== FILE_TYPES.VIDEO) {
//       return;
//     }

//     return {
//       url: gallery.item.value.src,
//       width: gallery.item.value.metadata.width,
//       height: gallery.item.value.metadata.height,
//       alt: gallery.item.value.name,
//     };
//   },
// });
</script>

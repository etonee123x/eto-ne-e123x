<template>
  <BaseDialog isHiddenFooter isHiddenHeader v-model="isDialogOpen" @close="onClose">
    <article v-if="gallery.item.value" class="flex flex-col gap-2 items-center flex-1 w-full h-full">
      <header class="contents">
        <BaseAlwaysScrollable class="w-full [--base-always-scrollable--content--margin:0_auto]" duration="12000ms">
          {{ gallery.item.value.name }}
        </BaseAlwaysScrollable>
      </header>
      <div class="flex-1 flex items-center justify-center overflow-hidden w-full h-full" ref="mediaContainer">
        <component
          :is="component.is"
          v-bind="component.binds"
          class="object-contain border-none max-w-full max-h-[calc(90dvh-2*4*var(--spacing)-6*var(--spacing)-2*var(--spacing))]"
          :src="gallery.item.value.src"
        />
      </div>
    </article>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { onKeyStroke, useSwipe, useToggle } from '@vueuse/core';
import { computed, useTemplateRef, watchEffect } from 'vue';

import BaseAlwaysScrollable from '@/components/ui/BaseAlwaysScrollable.vue';
import BaseDialog from '@/components/ui/BaseDialog.vue';
import { useRoute, useRouter } from 'vue-router';
import { FILE_TYPES } from '@etonee123x/shared/helpers/folderData';
import { ROUTE_NAMES } from '@/router';
import { useGallery } from '@/plugins/gallery';
import { useExplorerContext } from '@/views/Explorer/contexts/explorer';

const router = useRouter();
const route = useRoute();

const gallery = useGallery();
const explorerContext = useExplorerContext();

onKeyStroke('ArrowRight', gallery.next);
onKeyStroke('ArrowLeft', gallery.prev);

const mediaContainer = useTemplateRef('mediaContainer');

const component = computed(() =>
  gallery.item.value?.fileType === FILE_TYPES.VIDEO
    ? {
        is: 'video',
        binds: {
          controls: true,
        },
      }
    : {
        is: 'img',
      },
);

useSwipe(mediaContainer, {
  onSwipeEnd: (...[, direction]) => {
    if (direction === 'right') {
      gallery.prev();
    } else if (direction === 'left') {
      gallery.next();
    }
  },
});

const onClose = () => {
  gallery.items.value = [];

  if (router.resolve(route.fullPath).name !== ROUTE_NAMES.EXPLORER) {
    return;
  }

  const currentFolderData = explorerContext.currentFolderData();

  if (!currentFolderData?.linkedFile) {
    return;
  }

  const lastNavigationItem = currentFolderData.navigationItems.at(-1);

  if (!lastNavigationItem) {
    return;
  }

  router.push(lastNavigationItem.link);
};

const [isDialogOpen, toggleIsDialogOpen] = useToggle(Boolean(gallery.item.value));

watchEffect(() => toggleIsDialogOpen(Boolean(gallery.item.value)));
</script>

<template>
  <BaseDialog isHiddenFooter isHiddenHeader v-model="isDialogOpen" @close="onClose">
    <article v-if="galleryStore.galleryItem" class="flex flex-col gap-2 items-center flex-1 w-full h-full">
      <header class="contents">
        <BaseAlwaysScrollable class="w-full [--base-always-scrollable--content--margin:0_auto]" duration="12000ms">
          {{ galleryStore.galleryItem.name }}
        </BaseAlwaysScrollable>
      </header>
      <div class="flex-1 flex items-center justify-center overflow-hidden w-full h-full" ref="mediaContainer">
        <component
          :is="component.is"
          v-bind="component.binds"
          class="object-contain border-none max-w-full max-h-[calc(90dvh_-2*4*var(--spacing)_-6*var(--spacing)_-2*var(--spacing))]"
          :src="galleryStore.galleryItem.src"
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
import { useGalleryStore } from '@/stores/gallery';
import { useRoute, useRouter } from 'vue-router';
import { FILE_TYPES } from '@etonee123x/shared/helpers/folderData';
import { RouteName } from '@/router';
import { useExplorerStore } from '@/stores/explorer';

const router = useRouter();
const route = useRoute();

const galleryStore = useGalleryStore();
const explorerStore = useExplorerStore();

onKeyStroke('ArrowRight', () => galleryStore.next());
onKeyStroke('ArrowLeft', () => galleryStore.prev());

const mediaContainer = useTemplateRef('mediaContainer');

const component = computed(() =>
  galleryStore.galleryItem?.fileType === FILE_TYPES.VIDEO
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
      return galleryStore.prev();
    }

    if (direction === 'left') {
      return galleryStore.next();
    }
  },
});

const onClose = () => {
  galleryStore.galleryItems = [];

  if (router.resolve(route.fullPath).name !== RouteName.Explorer) {
    return;
  }

  const maybeFolderData = explorerStore.routePathToFolderData[route.fullPath];
  const maybeFolderDataLinkedFile = maybeFolderData?.linkedFile;

  if (!maybeFolderDataLinkedFile) {
    return;
  }

  const lastNavigationItem = maybeFolderData.navigationItems.at(-1);

  if (!lastNavigationItem) {
    return;
  }

  router.push(lastNavigationItem.link);
};

const [isDialogOpen, toggleIsDialogOpen] = useToggle(Boolean(galleryStore.galleryItem));

watchEffect(() => toggleIsDialogOpen(Boolean(galleryStore.galleryItem)));
</script>

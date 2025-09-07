<template>
  <BasePage :h1="t('content')" class="mx-auto">
    <ExplorerNavbar class="-m-2 mb-2 sticky top-0" />
    <div class="flex flex-col gap-2">
      <nav v-if="explorerStore.folderData?.lvlUp || elements.folders.length" class="contents">
        <LazyExplorerElementSystem
          v-if="explorerStore.folderData?.lvlUp"
          :to="explorerStore.folderData.lvlUp"
          tag="RouterLink"
        >
          ...
        </LazyExplorerElementSystem>
        <LazyExplorerElementFolder v-for="folder in elements.folders" :element="folder" :key="folder.src">
          {{ folder.name }}
        </LazyExplorerElementFolder>
      </nav>
      <component :is="itemFileToComponent(file)" v-for="file in elements.files" :element="file" :key="file.src" />
    </div>
    <TheDialogGallery />
  </BasePage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, watchEffect } from 'vue';
import { onBeforeRouteUpdate, useRoute, type RouteLocationNormalizedLoaded } from 'vue-router';
import { FILE_TYPES, ITEM_TYPES, type ItemFile, type ItemFolder } from '@etonee123x/shared/helpers/folderData';

import ExplorerNavbar from './components/ExplorerNavbar.vue';

import { useExplorerStore } from '@/stores/explorer';
import { useGoToPage404 } from '@/composables/useGoToPage404';
import { clientOnly } from '@/helpers/clientOnly';
import type { ItemWithSinceTimestamps } from '@/api/folderData';
import BasePage from '@/components/ui/BasePage.vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import TheDialogGallery from './components/TheDialogGallery.vue';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { usePlayerStore } from '@/stores/player';
import { useGalleryStore } from '@/stores/gallery';
import { useSourcedRef } from '@/composables/useSourcedRef';

const playerStore = usePlayerStore();
const galleryStore = useGalleryStore();

const LazyExplorerElementSystem = defineAsyncComponent(() => import('./components/ExplorerElementSystem.vue'));
const LazyExplorerElementFolder = defineAsyncComponent(() => import('./components/ExplorerElementFolder.vue'));

const LazyExplorerElementFileAudio = defineAsyncComponent(() => import('./components/ExplorerElementFileAudio.vue'));
const LazyExplorerElementFileImage = defineAsyncComponent(() => import('./components/ExplorerElementFileImage.vue'));
const LazyExplorerElementFileVideo = defineAsyncComponent(() => import('./components/ExplorerElementFileVideo.vue'));

const goToPage404 = useGoToPage404();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    Ru: {
      content: 'Контент',
      thatsWhatCloseToMe: 'То, что мне близко. Папка {folderName}, {description}',
      foldersAndFiles: 'папки и файлы; с музыкой, картинками, видосиками',
      listenToAudio: 'слушать аудио {fileName}, и другие @:foldersAndFiles',
      watchTheImage: 'смотреть изображение {fileName}, и другие @:foldersAndFiles',
      watchTheVideo: 'смотреть видео {fileName}, и другие @:foldersAndFiles',
    },
    En: {
      content: 'Content',
      thatsWhatCloseToMe: 'Thats what close to me. Folder {folderName}, {description}',
      foldersAndFiles: 'folders and files; with music, pictures, videos',
      listenToAudio: 'listen to audio {fileName}, and other @:foldersAndFiles',
      watchTheImage: 'watch the image {fileName}, and other @:foldersAndFiles',
      watchTheVideo: 'watch the video {fileName}, and other @:foldersAndFiles',
    },
  },
});

const explorerStore = useExplorerStore();

const route = useRoute();

const itemFileToComponent = (itemFile: ItemFile) => {
  switch (itemFile.fileType) {
    case FILE_TYPES.AUDIO:
      return LazyExplorerElementFileAudio;
    case FILE_TYPES.IMAGE:
      return LazyExplorerElementFileImage;
    case FILE_TYPES.VIDEO:
      return LazyExplorerElementFileVideo;
    default:
      return LazyExplorerElementSystem;
  }
};

const elements = computed(
  () =>
    explorerStore.folderData?.items.reduce<{
      folders: Array<ItemWithSinceTimestamps<ItemFolder>>;
      files: Array<ItemWithSinceTimestamps<ItemFile>>;
    }>(
      (elements, folderElement) =>
        folderElement.itemType === ITEM_TYPES.FOLDER
          ? {
              ...elements,
              folders: elements.folders.concat(folderElement),
            }
          : {
              ...elements,
              files: elements.files.concat(folderElement),
            },
      {
        folders: [],
        files: [],
      },
    ) ?? {
      folders: [],
      files: [],
    },
);

const fetchData = (to: RouteLocationNormalizedLoaded) => explorerStore.getFolderData(to).catch(goToPage404);

clientOnly(() => fetchData(route));

const maybeLastNavigationItemText = computed(() => explorerStore.folderData?.navigationItems.at(-1)?.text);

const [maybeSelectedFile, resetSelectedFile] = useSourcedRef<
  typeof playerStore.theTrack | typeof galleryStore.galleryItem | null
>(null);

// Два watchEffect нужны, чтобы отображался крайний выбранный + актуальный файл (плеер или галерея)
watchEffect(() => {
  if (playerStore.theTrack) {
    maybeSelectedFile.value = playerStore.theTrack;

    return;
  }

  if (galleryStore.galleryItem) {
    maybeSelectedFile.value = galleryStore.galleryItem;

    return;
  }

  resetSelectedFile();
});
watchEffect(() => {
  if (galleryStore.galleryItem) {
    maybeSelectedFile.value = galleryStore.galleryItem;

    return;
  }

  if (playerStore.theTrack) {
    maybeSelectedFile.value = playerStore.theTrack;

    return;
  }

  resetSelectedFile();
});

useSeoMeta({
  title: () =>
    [
      ...(isNotNil(maybeLastNavigationItemText.value) ? [maybeLastNavigationItemText.value] : []),
      ...(isNotNil(maybeSelectedFile.value) ? [maybeSelectedFile.value.name] : []),
    ].join(' – ') || undefined,
  description: () => {
    if (isNil(maybeLastNavigationItemText.value)) {
      return undefined;
    }

    let description: string;

    if (maybeSelectedFile.value?.fileType === FILE_TYPES.AUDIO) {
      description ??= t('listenToAudio', { fileName: maybeSelectedFile.value.name });
    }

    if (maybeSelectedFile.value?.fileType === FILE_TYPES.VIDEO) {
      description ??= t('watchTheVideo', { fileName: maybeSelectedFile.value.name });
    }

    if (maybeSelectedFile.value?.fileType === FILE_TYPES.IMAGE) {
      description ??= t('watchTheImage', { fileName: maybeSelectedFile.value.name });
    }

    description ??= t('foldersAndFiles');

    return t('thatsWhatCloseToMe', {
      folderName: maybeLastNavigationItemText.value,
      description,
    });
  },
});

onBeforeRouteUpdate((to) => void fetchData(to));
</script>

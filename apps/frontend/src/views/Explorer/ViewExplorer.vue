<template>
  <BasePage :h1="t('content')">
    <ExplorerNavbar class="-mt-2 mb-2 sticky top-0" />
    <div class="flex flex-col gap-2">
      <nav v-if="explorerContext.getFolderDataQuery.data.value?.lvlUp || elements.folders.length > 0" class="contents">
        <LazyExplorerElementSystem
          v-if="explorerContext.getFolderDataQuery.data.value?.lvlUp"
          :to="explorerContext.getFolderDataQuery.data.value.lvlUp"
          tag="RouterLink"
        >
          {{ t('treeDots') }}
        </LazyExplorerElementSystem>
        <LazyExplorerElementFolder v-for="folder in elements.folders" :element="folder" :key="folder.src">
          {{ folder.name }}
        </LazyExplorerElementFolder>
      </nav>
      <component :is="itemFileToComponent(file)" v-for="file in elements.files" :element="file" :key="file.src" />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, watchEffect } from 'vue';
import type { UnwrapRef } from 'vue';
import { FILE_TYPES, ITEM_TYPES } from '@etonee123x/shared/helpers/folderData';
import type { ItemFile, ItemFolder } from '@etonee123x/shared/helpers/folderData';

import ExplorerNavbar from './components/ExplorerNavbar.vue';

import type { ItemWithSinceTimestamps } from '@/api/folderData';
import BasePage from '@/components/ui/BasePage.vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { isNotNil } from '@etonee123x/shared/utils/isNotNil';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { useSourcedRef } from '@/composables/useSourcedRef';
import { usePlayer } from '@/plugins/player';
import { useGallery } from '@/plugins/gallery';
import { useExplorerContext } from './contexts/explorer';

const player = usePlayer();
const gallery = useGallery();

const LazyExplorerElementSystem = defineAsyncComponent(() => import('./components/ExplorerElementSystem.vue'));
const LazyExplorerElementFolder = defineAsyncComponent(() => import('./components/ExplorerElementFolder.vue'));

const LazyExplorerElementFileAudio = defineAsyncComponent(() => import('./components/ExplorerElementFileAudio.vue'));
const LazyExplorerElementFileImage = defineAsyncComponent(() => import('./components/ExplorerElementFileImage.vue'));
const LazyExplorerElementFileVideo = defineAsyncComponent(() => import('./components/ExplorerElementFileVideo.vue'));

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      content: 'Контент',
      thatsWhatCloseToMe: 'То, что мне близко. Папка {folderName}, {description}',
      foldersAndFiles: 'папки и файлы; с музыкой, картинками, видосиками',
      listenToAudio: 'слушать аудио {fileName}, и другие @:foldersAndFiles',
      watchTheImage: 'смотреть изображение {fileName}, и другие @:foldersAndFiles',
      watchTheVideo: 'смотреть видео {fileName}, и другие @:foldersAndFiles',
      treeDots: '...',
    },
    en: {
      content: 'Content',
      thatsWhatCloseToMe: 'Thats what close to me. Folder {folderName}, {description}',
      foldersAndFiles: 'folders and files; with music, pictures, videos',
      listenToAudio: 'listen to audio {fileName}, and other @:foldersAndFiles',
      watchTheImage: 'watch the image {fileName}, and other @:foldersAndFiles',
      watchTheVideo: 'watch the video {fileName}, and other @:foldersAndFiles',
      treeDots: '...',
    },
  },
});

const explorerContext = useExplorerContext();

const itemFileToComponent = (itemFile: ItemFile) => {
  switch (itemFile.fileType) {
    case FILE_TYPES.AUDIO: {
      return LazyExplorerElementFileAudio;
    }
    case FILE_TYPES.IMAGE: {
      return LazyExplorerElementFileImage;
    }
    case FILE_TYPES.VIDEO: {
      return LazyExplorerElementFileVideo;
    }
    default: {
      return LazyExplorerElementSystem;
    }
  }
};

const elements = computed(
  () =>
    explorerContext.getFolderDataQuery.data.value?.items.reduce<{
      folders: Array<ItemWithSinceTimestamps<ItemFolder>>;
      files: Array<ItemWithSinceTimestamps<ItemFile>>;
    }>(
      (elements, folderElement) =>
        folderElement.itemType === ITEM_TYPES.FOLDER
          ? {
              ...elements,
              folders: [...elements.folders, folderElement],
            }
          : {
              ...elements,
              files: [...elements.files, folderElement],
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

const maybeLastNavigationItemText = computed(
  () => explorerContext.getFolderDataQuery.data.value?.navigationItems.at(-1)?.text,
);

const [maybeSelectedFile, resetSelectedFile] = useSourcedRef<UnwrapRef<
  typeof player.theTrack | typeof gallery.item
> | null>(null);

// Два watchEffect нужны, чтобы отображался крайний выбранный + актуальный файл (плеер или галерея)
watchEffect(() => {
  if (player.theTrack.value) {
    maybeSelectedFile.value = player.theTrack.value;

    return;
  }

  if (gallery.item.value) {
    maybeSelectedFile.value = gallery.item.value;

    return;
  }

  resetSelectedFile();
});
watchEffect(() => {
  if (gallery.item.value) {
    maybeSelectedFile.value = gallery.item.value;

    return;
  }

  if (player.theTrack.value) {
    maybeSelectedFile.value = player.theTrack.value;

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

    let description: string | null = null;

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
</script>

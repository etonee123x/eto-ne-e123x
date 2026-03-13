<template>
  <BasePage :h1="t('content')">
    <ExplorerNavbar class="-mt-2 mb-2 sticky top-0" />
    <div class="flex flex-col gap-2">
      <nav v-if="shouldRenderNav" class="contents">
        <LazyExplorerElementSystem
          v-if="explorerContext.navigationLinks.value.length > 1"
          :to="nonNullable(explorerContext.navigationLinks.value.at(-2)).to"
          class="p-2"
          tag="RouterLink"
        >
          {{ t('treeDots') }}
        </LazyExplorerElementSystem>
        <LazyExplorerElementFolder
          v-for="folder in explorerContext.getFolderDataQuery.data.value?.folders"
          :to="folderDataItemToTo(folder)"
          :element="folder"
          :key="folder.name"
        >
          {{ folder.name }}
        </LazyExplorerElementFolder>
      </nav>
      <component
        :is="itemFileToComponent(file)"
        v-for="file in explorerContext.getFolderDataQuery.data.value?.files"
        :to="folderDataItemToTo(file)"
        :element="file"
        :key="file.name"
      />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, watchEffect } from 'vue';
import type { UnwrapRef } from 'vue';
import { FILE_TYPES } from '@/helpers/folderData';

import ExplorerNavbar from './components/ExplorerNavbar.vue';

import BasePage from '@/components/ui/BasePage.vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { useResetableRef } from '@/composables/useResetableRef';
import { usePlayer } from '@/plugins/player';
import { useGallery } from '@/plugins/gallery';
import { useExplorerContext } from './contexts/explorer';
import { nonNullable } from '@/utils/nonNullable';
import type { components } from '@/types/openapi';
import { useL10n } from '@/composables/useL10n';

const l10n = useL10n();
const player = usePlayer();
const gallery = useGallery();

const LazyExplorerElementSystem = defineAsyncComponent(() => {
  return import('./components/ExplorerElementSystem.vue');
});

const LazyExplorerElementFolder = defineAsyncComponent(() => {
  return import('./components/ExplorerElementFolder.vue');
});

const LazyExplorerElementFileAudio = defineAsyncComponent(() => {
  return import('./components/ExplorerElementFileAudio.vue');
});
const LazyExplorerElementFileImage = defineAsyncComponent(() => {
  return import('./components/ExplorerElementFileImage.vue');
});
const LazyExplorerElementFileVideo = defineAsyncComponent(() => {
  return import('./components/ExplorerElementFileVideo.vue');
});

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

const shouldRenderNav = computed(() => {
  return Boolean(
    explorerContext.navigationLinks.value.length > 1 ||
      (explorerContext.getFolderDataQuery.data.value &&
        explorerContext.getFolderDataQuery.data.value.folders.length > 0),
  );
});

const itemFileToComponent = (itemFile: components['schemas']['FolderDataItemFile']) => {
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

const folderDataItemToTo = (
  folderDataItem: components['schemas']['FolderDataItemFolder'] | components['schemas']['FolderDataItemFile'],
) => {
  return l10n.localizePath(['/explorer', folderDataItem.path].join('/'));
};

const maybeLastNavigationItemText = computed(() => {
  return explorerContext.navigationLinks.value.at(-1)?.text;
});

const resetableRefSelectedFile = useResetableRef<UnwrapRef<typeof player.theTrack | typeof gallery.item> | null>(null);

// Два watchEffect нужны, чтобы отображался крайний выбранный + актуальный файл (плеер или галерея)
watchEffect(() => {
  if (player.theTrack.value) {
    resetableRefSelectedFile.value.value = player.theTrack.value;

    return;
  }

  if (gallery.item.value) {
    resetableRefSelectedFile.value.value = gallery.item.value;

    return;
  }

  resetableRefSelectedFile.reset();
});
watchEffect(() => {
  if (gallery.item.value) {
    resetableRefSelectedFile.value.value = gallery.item.value;
    return;
  }

  if (player.theTrack.value) {
    resetableRefSelectedFile.value.value = player.theTrack.value;

    return;
  }

  resetableRefSelectedFile.reset();
});

useSeoMeta({
  title: () => {
    return (
      [
        ...(isNil(maybeLastNavigationItemText.value) ? [] : [maybeLastNavigationItemText.value]),
        ...(isNil(resetableRefSelectedFile.value.value) ? [] : [resetableRefSelectedFile.value.value.name]),
      ].join(' – ') || undefined
    );
  },
  description: () => {
    if (isNil(maybeLastNavigationItemText.value)) {
      return undefined;
    }

    let description: string | null = null;

    if (resetableRefSelectedFile.value.value?.fileType === FILE_TYPES.AUDIO) {
      description ??= t('listenToAudio', { fileName: resetableRefSelectedFile.value.value.name });
    }

    if (resetableRefSelectedFile.value.value?.fileType === FILE_TYPES.VIDEO) {
      description ??= t('watchTheVideo', { fileName: resetableRefSelectedFile.value.value.name });
    }

    if (resetableRefSelectedFile.value.value?.fileType === FILE_TYPES.IMAGE) {
      description ??= t('watchTheImage', { fileName: resetableRefSelectedFile.value.value.name });
    }

    description ??= t('foldersAndFiles');

    return t('thatsWhatCloseToMe', {
      folderName: maybeLastNavigationItemText.value,
      description,
    });
  },
});
</script>

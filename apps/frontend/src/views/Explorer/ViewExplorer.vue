<template>
  <BasePage :h1="t('content')">
    <ExplorerNavbar class="-mt-2 mb-2 sticky top-header-height" :navigationItems />
    <div class="flex flex-col gap-2">
      <nav v-if="shouldRenderNav" class="contents">
        <LazyExplorerElementSystem
          v-if="navigationItems.length > 1"
          :to="nonNullable(navigationItems.at(-2)).to"
          class="p-2"
          tag="RouterLink"
        >
          {{ t('treeDots') }}
        </LazyExplorerElementSystem>
        <LazyExplorerElementFolder
          v-for="folder in explorerContext.getFolderDataQuery.data?.folders"
          :to="folderDataItemToTo(folder)"
          :element="folder"
          :key="folder.name"
        >
          {{ folder.name }}
        </LazyExplorerElementFolder>
      </nav>
      <component
        :is="itemFileToComponent(file)"
        v-for="file in explorerContext.getFolderDataQuery.data?.files"
        :to="folderDataItemToTo(file)"
        :element="file"
        :key="file.name"
      />
    </div>
    <LazyDialogGallery
      v-if="galleryItem"
      :item="galleryItem"
      :items="explorerContext.getFolderDataQuery.data?.files.filter((file) => isFolderDataGalleryItem(file)) ?? []"
      :onClose="onCloseGallery"
      :onChangeItem="onChangeGalleryItem"
    >
    </LazyDialogGallery>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onScopeDispose } from 'vue';
import { FILE_TYPES, isFolderDataGalleryItem, isFolderDataItemImage } from '@/helpers/folderData';

import ExplorerNavbar from './components/ExplorerNavbar.vue';

import BasePage from '@/components/ui/BasePage.vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { usePlayer } from '@/plugins/player';
import { provideExplorerContext } from './contexts/explorer';
import { nonNullable } from '@/utils/nonNullable';
import type { components } from '@/types/openapi';
import { useL10n } from '@/composables/useL10n';
import { useRouter } from 'vue-router';

const explorerContext = await provideExplorerContext();

const l10n = useL10n();
const player = usePlayer();

const lastNavigationItem = computed(() => {
  return navigationItems.value.at(-1);
});

const folderName = computed(() => {
  return lastNavigationItem.value?.text;
});

const onBeforeUnload = () => {
  if (!explorerContext.getFolderDataQuery.data?.file) {
    return;
  }

  if (player.playlist.value.pathDirectory !== explorerContext.getFolderDataQuery.data.pathDirectory) {
    return;
  }

  if (!lastNavigationItem.value) {
    return;
  }

  router.push(lastNavigationItem.value.to);
};

player.hooksOnUnload.before.add(onBeforeUnload);
onScopeDispose(() => {
  player.hooksOnUnload.before.delete(onBeforeUnload);
});

const LazyDialogGallery = defineAsyncComponent(() => {
  return import('@/components/DialogGallery.vue');
});

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

const navigationItems = computed(() => {
  return (
    explorerContext.getFolderDataQuery.data?.pathDirectory
      .split('/')
      .filter(Boolean)
      .reduce(
        (segments, segment) => {
          return [
            ...segments,
            {
              text: segment,
              to: [nonNullable(segments.at(-1)).to, segment].join('/'),
            },
          ];
        },
        [
          {
            text: 'root',
            to: l10n.localizePath('explorer'),
          },
        ],
      ) ?? []
  );
});

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      content: 'Контент',
      treeDots: '...',
      description: {
        soWhatWeHaveHere:
          'Оппа, что тут у нас? Папка {folderName}{fileDescription} и другие папки и файлы; с музыкой, картинками, видосиками',
        watch: ', смотреть {type} {fileName}',
        image: 'изображение',
        video: 'видео',
      },
    },
    en: {
      content: 'Content',
      treeDots: '...',
      description: {
        soWhatWeHaveHere:
          'Hmm-m, what do we have here? Folder {folderName}{fileDescription} and other folders and files; with music, pictures, videos',
        watch: ', watch the {type} {fileName}',
        image: 'image',
        video: 'video',
      },
    },
  },
});

const shouldRenderNav = computed(() => {
  return Boolean(
    navigationItems.value.length > 1 ||
    (explorerContext.getFolderDataQuery.data && explorerContext.getFolderDataQuery.data.folders.length > 0),
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

const galleryItem = computed(() => {
  if (!explorerContext.getFolderDataQuery.data?.file) {
    return undefined;
  }

  if (!isFolderDataGalleryItem(explorerContext.getFolderDataQuery.data.file)) {
    return undefined;
  }

  return explorerContext.getFolderDataQuery.data.file;
});

const router = useRouter();

const onCloseGallery = () => {
  if (!explorerContext.getFolderDataQuery.data?.file) {
    return;
  }

  if (!lastNavigationItem.value) {
    return;
  }

  router.push(lastNavigationItem.value.to);
};

const onChangeGalleryItem = (
  item: components['schemas']['FolderDataItemImage'] | components['schemas']['FolderDataItemVideo'],
) => {
  router.replace(folderDataItemToTo(item));
};

useSeoMeta({
  title: () => {
    return folderName.value ?? undefined;
  },
  description: () => {
    if (isNil(folderName.value)) {
      return undefined;
    }

    return t('description.soWhatWeHaveHere', {
      folderName: folderName.value,
      fileDescription: galleryItem.value
        ? t('description.watch', {
            type: isFolderDataItemImage(galleryItem.value) //
              ? t('description.image')
              : t('description.video'),
            fileName: galleryItem.value.name,
          })
        : undefined,
    });
  },
});
</script>

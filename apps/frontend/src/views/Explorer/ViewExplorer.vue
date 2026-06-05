<template>
  <BasePage :h1="t('content')">
    <nav class="z-explorer-navbar -mt-2 mb-2 sticky top-header-height">
      <ul
        class="bg-background -mx-(--container-padding) px-(--container-padding) flex items-center overflow-x-auto py-1"
      >
        <li
          v-for="navigationItem in navigationItems"
          class="whitespace-nowrap last:text-primary-500 after:px-2 after:content-['>'] last:after:content-['']"
          :key="navigationItem.to"
        >
          <RouterLink :to="navigationItem.to">
            {{ navigationItem.text }}
          </RouterLink>
        </li>
      </ul>
    </nav>
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
        v-bind="itemFileToBinds(file)"
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
import { computed, defineAsyncComponent, onScopeDispose, reactive, toRef } from 'vue';
import {
  FILE_TYPES,
  isFolderDataGalleryItem,
  isFolderDataItemFileAudio,
  isFolderDataItemFileImage,
  isFolderDataItemFileVideo,
} from '@/helpers/folderData';

import BasePage from '@/components/ui/BasePage.vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { usePlayer } from '@/plugins/player';
import { provideExplorerContext } from './contexts/explorer';
import { nonNullable } from '@/utils/nonNullable';
import type { components } from '@/types/openapi';
import { useL10n } from '@/composables/useL10n';
import { useRouter } from 'vue-router';
import { millisecondsToHumanReadable } from '@/utils/millisecondsToHumanReadable';
import { useIntlListFormat } from '@/composables/useIntlListFormat';
import { useMediaControls } from '@vueuse/core';

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

const explorerContext = await provideExplorerContext();

const l10n = useL10n();
const player = reactive(usePlayer());

const mediaControls = reactive(useMediaControls(toRef(player, 'audio')));

const progress = computed(() => {
  if (!player.theTrack.value?.metadata.duration) {
    return 0;
  }

  return ((mediaControls.currentTime * 1000) / player.theTrack.value.metadata.duration) * 100;
});

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
              to: [nonNullable(segments.at(-1)).to, encodeURIComponent(segment)].join('/'),
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
        common: {
          soWhatWeHaveHere:
            'Оппа, что тут у нас? Папка {folderName}{fileDescription} и другие папки и файлы; с музыкой, картинками, видосиками',
          watch: ', смотреть {type} {fileName}',
          image: 'изображение',
          video: 'видео',
        },
        audio: {
          checkOutTrack: 'Зацени трек "{name}" — {artists}{album}{year}{duration} и чо нибудь ещё',
          artists: ' {artists}',
          album: ' из "{album}"',
          year: ' ({year})',
          duration: ' длительностью {duration}',
          idkWho: 'хз кто',
        },
      },
    },
    en: {
      content: 'Content',
      treeDots: '...',
      description: {
        common: {
          soWhatWeHaveHere:
            'Hmm-m, what do we have here? Folder {folderName}{fileDescription} and other folders and files; with music, pictures, videos',
          watch: ', watch the {type} {fileName}',
          image: 'image',
          video: 'video',
        },
        audio: {
          checkOutTrack: 'Check out the track "{name}" — {artists}{album}{year}{duration} and something else',
          artists: ' {artists}',
          album: ' from "{album}"',
          year: ' ({year})',
          duration: ' with a duration of {duration}',
          idkWho: 'idk who',
        },
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

const itemFileToBinds = (itemFile: components['schemas']['FolderDataItemFile']) => {
  switch (itemFile.fileType) {
    case FILE_TYPES.AUDIO: {
      return {
        progress: player.theTrack.value?.src === itemFile.src ? progress.value : undefined,
      };
    }
    default: {
      return {};
    }
  }
};

const folderDataItemToTo = (
  folderDataItem: components['schemas']['FolderDataItemFolder'] | components['schemas']['FolderDataItemFile'],
) => {
  return l10n.localizePath(
    [
      '/explorer',
      folderDataItem.path
        .split('/')
        .map((uriComponent) => {
          return encodeURIComponent(uriComponent);
        })
        .join('/'),
    ].join('/'),
  );
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

const intlListFormat = useIntlListFormat(undefined, { style: 'long', type: 'conjunction' });

useSeoMeta({
  title: () => {
    return explorerContext.getFolderDataQuery.data?.file?.name ?? folderName.value ?? undefined;
  },

  description: () => {
    if (isFolderDataItemFileAudio(explorerContext.getFolderDataQuery.data?.file)) {
      return t('description.audio.checkOutTrack', {
        name: explorerContext.getFolderDataQuery.data.file.name,
        artists:
          explorerContext.getFolderDataQuery.data.file.metadata.artists.length > 0
            ? intlListFormat.value.format(explorerContext.getFolderDataQuery.data.file.metadata.artists)
            : t('description.audio.idkWho'),
        album:
          explorerContext.getFolderDataQuery.data.file.metadata.album || folderName.value
            ? t('description.audio.album', {
                album: explorerContext.getFolderDataQuery.data.file.metadata.album ?? folderName.value,
              })
            : undefined,
        year: explorerContext.getFolderDataQuery.data.file.metadata.year
          ? t('description.audio.year', { year: explorerContext.getFolderDataQuery.data.file.metadata.year })
          : undefined,
        duration: explorerContext.getFolderDataQuery.data.file.metadata.duration
          ? t('description.audio.duration', {
              duration: millisecondsToHumanReadable(explorerContext.getFolderDataQuery.data.file.metadata.duration),
            })
          : undefined,
      });
    }

    return t('description.common.soWhatWeHaveHere', {
      folderName: folderName.value,
      fileDescription: galleryItem.value
        ? t('description.common.watch', {
            type: isFolderDataItemFileImage(galleryItem.value) //
              ? t('description.common.image')
              : t('description.common.video'),
            fileName: galleryItem.value.name,
          })
        : undefined,
    });
  },

  // именно так и надо
  ogImage: () => {
    const image = isFolderDataItemFileImage(explorerContext.getFolderDataQuery.data?.file)
      ? explorerContext.getFolderDataQuery.data.file
      : explorerContext.getFolderDataQuery.data?.files.find((file) => {
          return isFolderDataItemFileImage(file);
        });

    if (!image) {
      return undefined;
    }

    return {
      url: image.src,
      alt: image.name,
      width: image.metadata.width,
      height: image.metadata.height,
    };
  },

  // именно так и надо
  ogVideo: () => {
    const video = isFolderDataItemFileVideo(explorerContext.getFolderDataQuery.data?.file)
      ? explorerContext.getFolderDataQuery.data.file
      : explorerContext.getFolderDataQuery.data?.files.find((file) => {
          return isFolderDataItemFileVideo(file);
        });

    if (!video) {
      return undefined;
    }

    return {
      url: video.src,
      alt: video.name,
      width: video.metadata.width,
      height: video.metadata.height,
    };
  },

  // именно так и надо
  ogAudio: () => {
    const audio = isFolderDataItemFileAudio(explorerContext.getFolderDataQuery.data?.file)
      ? explorerContext.getFolderDataQuery.data.file
      : explorerContext.getFolderDataQuery.data?.files.find((file) => {
          return isFolderDataItemFileAudio(file);
        });

    if (!audio) {
      return undefined;
    }

    return {
      url: audio.src,
    };
  },
});
</script>

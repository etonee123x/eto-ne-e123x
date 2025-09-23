import { defineStore } from 'pinia';
import { computed, shallowReactive } from 'vue';

import { usePlayerStore } from '@/stores/player';
import { getFolderData as _getFolderData, type FolderDataWithSinceTimestamps } from '@/api/folderData';
import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router';
import { useGalleryStore } from '@/stores/gallery';
import { FILE_TYPES, ITEM_TYPES } from '@etonee123x/shared/helpers/folderData';
import { useL10n } from '@/composables/useL10n';
import { throwError } from '@etonee123x/shared/utils/throwError';

export const useExplorerStore = defineStore('explorer', () => {
  const playerStore = usePlayerStore();
  const galleryStore = useGalleryStore();
  const route = useRoute();

  const { localizePath } = useL10n();

  const moduleURLResolver = (url: string) => localizePath(`/explorer${url}`);

  const routePathToFolderData = shallowReactive<Record<string, FolderDataWithSinceTimestamps>>({});

  const {
    state: folderData,
    execute: getFolderData,
    isLoading: isLoadingGetFolderData,
  } = useAsyncStateApi(async (to: RouteLocationNormalizedLoaded) => {
    const matterPath = '/' + Array.from(to.params.links ?? []).join('/');

    const maybeFolderData = routePathToFolderData[matterPath];

    const folderData =
      maybeFolderData ??
      (await _getFolderData(matterPath)
        .then((_folderData) => ({
          items: _folderData.items.map((item) => ({
            ...item,
            url: moduleURLResolver(item.url),
          })),
          lvlUp: _folderData.lvlUp && moduleURLResolver(_folderData.lvlUp),
          navigationItems: _folderData.navigationItems.map((navigationItem) => ({
            ...navigationItem,
            link: moduleURLResolver(navigationItem.link),
          })),
          linkedFile: _folderData.linkedFile && {
            ..._folderData.linkedFile,
            url: moduleURLResolver(_folderData.linkedFile.url),
          },
        }))
        .catch(throwError));

    routePathToFolderData[matterPath] = folderData;

    const folderDataLinkedFile = folderData.linkedFile;

    if (!folderDataLinkedFile) {
      galleryStore.galleryItems = [];

      return folderData;
    }

    if (folderDataLinkedFile.fileType === FILE_TYPES.AUDIO) {
      playerStore.playlist = folderData.items.filter(
        (item) => item.itemType === ITEM_TYPES.FILE && item.fileType === FILE_TYPES.AUDIO,
      );

      playerStore.theTrack = folderDataLinkedFile;
      playerStore.currentPlayingNumber = playerStore.playlist.findIndex(
        (playlistItem) => playlistItem.src === folderDataLinkedFile.src,
      );
    } else if (
      folderDataLinkedFile.fileType === FILE_TYPES.IMAGE ||
      folderDataLinkedFile.fileType === FILE_TYPES.VIDEO
    ) {
      galleryStore.loadGalleryItemFromCurrentExplorerFolder(folderDataLinkedFile, folderData);
    }

    return folderData;
  });

  const currentFolderData = computed(() => routePathToFolderData['/' + Array.from(route.params.links ?? []).join('/')]);

  return {
    routePathToFolderData,
    currentFolderData,

    getFolderData,
    isLoadingGetFolderData,
    folderData,
  };
});

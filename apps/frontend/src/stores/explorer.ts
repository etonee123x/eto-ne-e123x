import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';

import { usePlayerStore } from '@/stores/player';
import { getFolderData as _getFolderData, type FolderDataWithSinceTimestamps } from '@/api/folderData';
import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { type RouteLocationNormalizedLoaded } from 'vue-router';
import { useGalleryStore } from '@/stores/gallery';
import { FILE_TYPES, ITEM_TYPES } from '@etonee123x/shared/helpers/folderData';

const moduleURLResolver = (url: string) => `/explorer${url.replace(/^\/explorer/, '')}`;

export const useExplorerStore = defineStore('explorer', () => {
  const playerStore = usePlayerStore();
  const galleryStore = useGalleryStore();

  const routePathToFolderData = shallowReactive<Record<string, FolderDataWithSinceTimestamps>>({});

  const {
    state: folderData,
    execute: getFolderData,
    isLoading: isLoadingGetFolderData,
  } = useAsyncStateApi(async (to: RouteLocationNormalizedLoaded) => {
    const maybeFolderData = routePathToFolderData[to.path];

    const _folderData = maybeFolderData ?? (await _getFolderData(to.path.replace(/^\/explorer/, '')));

    const folderData: FolderDataWithSinceTimestamps = {
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
    };

    routePathToFolderData[to.path] = folderData;

    const folderDataLinkedFile = folderData.linkedFile;

    if (!folderDataLinkedFile) {
      galleryStore.unloadGalleryItem();

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

  return {
    // SSR compatibility
    routePathToFolderData,

    getFolderData,
    isLoadingGetFolderData,
    folderData,
  };
});

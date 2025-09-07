import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useCycleList } from '@vueuse/core';
import { pick } from '@etonee123x/shared/utils/pick';

import { useExplorerStore } from './explorer';

import { FILE_TYPES, ITEM_TYPES, type ItemImage, type ItemVideo } from '@etonee123x/shared/helpers/folderData';

type GalleryItem = Pick<ItemImage | ItemVideo, 'src' | 'name' | 'fileType'>;

export const useGalleryStore = defineStore('gallery', () => {
  const explorerStore = useExplorerStore();

  const galleryItems = ref<Array<GalleryItem>>([]);

  const isGalleryItemLoaded = computed(() => Boolean(galleryItem.value));

  const loadGalleryItem = (_galleryItem: GalleryItem, _galleryItems: Array<GalleryItem> = []) => {
    galleryItem.value = _galleryItem;
    galleryItems.value = _galleryItems;
  };

  const unloadGalleryItem = () => {
    galleryItems.value = [];
  };

  const {
    next,
    prev,
    state: galleryItem,
  } = useCycleList<GalleryItem | undefined>(galleryItems, {
    getIndexOf: (value, list) => list.findIndex((item) => item?.src === value?.src),
  });

  const loadGalleryItemFromCurrentExplorerFolder = (
    explorerElement: ItemImage | ItemVideo,
    folderData = explorerStore.folderData,
  ) =>
    loadGalleryItem(
      pick(explorerElement, ['name', 'src', 'fileType']),
      folderData?.items.reduce<Array<GalleryItem>>(
        (acc, folderElement) =>
          folderElement.itemType === ITEM_TYPES.FILE &&
          (folderElement.fileType === FILE_TYPES.IMAGE || folderElement.fileType === FILE_TYPES.VIDEO)
            ? [...acc, pick(folderElement, ['name', 'src', 'fileType'])]
            : acc,
        [],
      ),
    );

  return {
    galleryItem,
    galleryItems,

    isGalleryItemLoaded,

    loadGalleryItem,
    unloadGalleryItem,
    loadGalleryItemFromCurrentExplorerFolder,

    next,
    prev,
  };
});

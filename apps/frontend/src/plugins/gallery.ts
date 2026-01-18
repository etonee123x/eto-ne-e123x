import { isFolderDataItemImage, isFolderDataItemVideo } from '@/helpers/folderData';
import type { components } from '@/types/openapi';
import { objectGet } from '@etonee123x/shared/utils/objectGet';
import { useCycleList } from '@vueuse/core';
import { computed, inject, shallowRef } from 'vue';
import type { FunctionPlugin, InjectionKey, ShallowRef } from 'vue';

type Item = components['schemas']['FolderDataItemImage'] | components['schemas']['FolderDataItemVideo'];
type Items = Array<Item>;

interface Context {
  items: ShallowRef<Items>;
  item: ShallowRef<Item | undefined>;
  next: () => void;
  prev: () => void;
  loadGalleryItem: (item: Item, items: Items) => void;
}

export const INJECTION_KEY_GALLERY: InjectionKey<Context> = Symbol('gallery');

export const createGallery = () => {
  const items = shallowRef<Items>([]);

  const loadGalleryItem = (_item: Item, _items: Items = []) => {
    item.value = _item;
    items.value = _items;
  };

  const {
    next,
    prev,
    state: item,
  } = useCycleList<Item | undefined>(items, {
    getIndexOf: (item, list) => {
      return list.findIndex((_item) => {
        return _item?.src === item?.src;
      });
    },
  });

  const install: FunctionPlugin = (app) => {
    app.provide(INJECTION_KEY_GALLERY, {
      item,
      items,
      next,
      prev,
      loadGalleryItem,
    });
  };

  const init = () => {
    const _item = objectGet(globalThis.__GALLERY__, 'item');
    const _items = objectGet(globalThis.__GALLERY__, 'items');

    if (
      (isFolderDataItemImage(_item) || isFolderDataItemVideo(_item)) &&
      Array.isArray(_items) &&
      _items.every((item) => {
        return isFolderDataItemImage(item) || isFolderDataItemVideo(item);
      })
    ) {
      item.value = _item;
      items.value = _items;
    }
  };

  return {
    install,
    init,

    state: computed(() => {
      return {
        item: item.value,
        items: items.value,
      };
    }),
  };
};

export const useGallery = () => {
  const gallery = inject(INJECTION_KEY_GALLERY);

  if (!gallery) {
    throw new Error('Gallery plugin is not installed');
  }

  return gallery;
};

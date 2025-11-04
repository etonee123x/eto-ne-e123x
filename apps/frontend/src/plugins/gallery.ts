import type { ItemImage, ItemVideo } from '@etonee123x/shared/helpers/folderData';
import { useCycleList } from '@vueuse/core';
import { computed, inject, shallowRef } from 'vue';
import type { FunctionPlugin, InjectionKey, ShallowRef, UnwrapRef } from 'vue';

type Item = Pick<ItemImage | ItemVideo, 'src' | 'name' | 'fileType'>;
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
    getIndexOf: (item, list) => list.findIndex((_item) => _item?.src === item?.src),
  });

  const install: FunctionPlugin = (app, options: Partial<Pick<UnwrapRef<Context>, 'items' | 'item'>> = {}) => {
    items.value = options.items ?? items.value;
    item.value = options.item ?? item.value;

    app.provide(INJECTION_KEY_GALLERY, {
      item,
      items,
      next,
      prev,
      loadGalleryItem,
    });
  };

  return {
    install,

    state: computed(() => ({
      item: item.value,
      items: items.value,
    })),
  };
};

export const useGallery = () => {
  const gallery = inject(INJECTION_KEY_GALLERY);

  if (!gallery) {
    throw new Error('Gallery plugin is not installed');
  }

  return gallery;
};

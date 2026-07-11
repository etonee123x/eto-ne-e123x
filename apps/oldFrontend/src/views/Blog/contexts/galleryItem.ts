import { useResetableRef } from '@/composables/useResetableRef';
import type { components } from '@/types/openapi';
import { nonNullable } from '@/utils/nonNullable';
import { inject, provide, reactive } from 'vue';
import type { InjectionKey, Reactive } from 'vue';

type Context = Reactive<
  ReturnType<
    typeof useResetableRef<
      components['schemas']['FolderDataItemImage'] | components['schemas']['FolderDataItemVideo'] | null
    >
  >
>;

const INJECTION_KEY = Symbol('blog-gallery-item') as InjectionKey<Context>;

export const provideGalleryItemContext = () => {
  const galleryItem: Context = reactive(useResetableRef(null));

  provide(INJECTION_KEY, galleryItem);

  return galleryItem;
};

export const useGalleryItemContext = () => {
  return nonNullable(inject(INJECTION_KEY));
};

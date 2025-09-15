<template>
  <component :is="component.is" class="max-w-full" v-bind="component.binds" @click.stop.prevent />
</template>

<script setup lang="ts">
import { pick } from '@etonee123x/shared/utils/pick';
import { computed, defineAsyncComponent } from 'vue';

import { useGalleryStore } from '@/stores/gallery';
import { useBlogStore } from '@/stores/blog';
import { useI18n } from 'vue-i18n';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { extensionToFileType, FILE_TYPES } from '@etonee123x/shared/helpers/folderData';

const LazyAttachmentWithUnknownExtension = defineAsyncComponent(() => import('./AttachmentWithUnknownExtension.vue'));
const LazyPreviewVideo = defineAsyncComponent(() => import('@/components/PreviewVideo.vue'));

const props = defineProps<{
  fileUrl: string;
  index: number;
}>();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    Ru: {
      attachmentN: 'Вложение { N }',
    },
    En: {
      attachmentN: 'Attachment { N }',
    },
  },
});

const galleryStore = useGalleryStore();
const blogStore = useBlogStore();

const getFileUrlExtension = (url: string) => url.match(/\.[^.]*$/gim)?.[0];

const loadToGallery = () => {
  const getLastParameter = (url: string) => url.match(/(?<=\/)[^/]*$/gim)?.[0];

  const maybeExtension = getFileUrlExtension(props.fileUrl);

  if (isNil(maybeExtension)) {
    return;
  }

  const fileType = extensionToFileType(maybeExtension);

  if (!(fileType === FILE_TYPES.IMAGE || fileType === FILE_TYPES.VIDEO)) {
    return;
  }

  const maybeLastParameter = getLastParameter(props.fileUrl);

  if (isNil(maybeLastParameter)) {
    return;
  }

  galleryStore.loadGalleryItem(
    {
      name: maybeLastParameter,
      src: props.fileUrl,
      fileType,
    },
    blogStore.all.reduce<NonNullable<Parameters<typeof galleryStore.loadGalleryItem>[1]>>(
      (acc, post) => [
        ...acc,
        ...post.filesUrls.reduce<NonNullable<Parameters<typeof galleryStore.loadGalleryItem>[1]>>((acc, fileUrl) => {
          const maybeExtension = getFileUrlExtension(fileUrl);

          if (isNil(maybeExtension)) {
            return acc;
          }

          const fileType = extensionToFileType(maybeExtension);

          if (!(fileType === FILE_TYPES.IMAGE || fileType === FILE_TYPES.VIDEO)) {
            return acc;
          }

          const maybeLastParameter = getLastParameter(fileUrl);

          if (isNil(maybeLastParameter)) {
            return acc;
          }

          return [...acc, { name: maybeLastParameter, src: fileUrl, fileType }];
        }, []),
      ],
      [],
    ),
  );
};

const component = computed(() => {
  const maybeExtension = getFileUrlExtension(props.fileUrl);

  if (isNil(maybeExtension)) {
    return {
      is: LazyAttachmentWithUnknownExtension,
      binds: pick(props, ['fileUrl']),
    };
  }

  const fileType = extensionToFileType(maybeExtension);

  switch (fileType) {
    case FILE_TYPES.IMAGE:
      return {
        is: 'img',
        binds: {
          src: props.fileUrl,
          alt: t('attachmentN', { N: props.index + 1 }),
          onClick: loadToGallery,
        },
      };
    case FILE_TYPES.AUDIO:
      return {
        is: 'audio',
        binds: {
          src: props.fileUrl,
          controls: true,
        },
      };
    case FILE_TYPES.VIDEO:
      return {
        is: LazyPreviewVideo,
        binds: {
          src: props.fileUrl,
          onClick: loadToGallery,
        },
      };
    default:
      return {
        is: LazyAttachmentWithUnknownExtension,
        binds: pick(props, ['fileUrl']),
      };
  }
});
</script>

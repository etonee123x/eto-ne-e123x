<template>
  <component :is="component.is" class="max-w-full" v-bind="component.binds" @click.stop.prevent />
</template>

<script setup lang="ts">
import { pick } from '@etonee123x/shared/utils/pick';
import { computed, defineAsyncComponent } from 'vue';

import { useI18n } from 'vue-i18n';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { extensionToFileType, FILE_TYPES } from '@etonee123x/shared/helpers/folderData';
import { useGallery } from '@/plugins/gallery';
import { useBlogContext } from '../contexts/blog';

const LazyAttachmentWithUnknownExtension = defineAsyncComponent(() => import('./AttachmentWithUnknownExtension.vue'));
const LazyPreviewVideo = defineAsyncComponent(() => import('@/components/PreviewVideo.vue'));

const props = defineProps<{
  fileUrl: string;
  index: number;
}>();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      attachmentN: 'Вложение { N }',
    },
    en: {
      attachmentN: 'Attachment { N }',
    },
  },
});

const gallery = useGallery();
const blogContext = useBlogContext();

const getFileUrlExtension = (url: string) => url.match(/\.[^.]*$/gim)?.[0];
const getLastParameter = (url: string) => url.match(/(?<=\/)[^/]*$/gim)?.[0];

const loadToGallery = () => {
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

  gallery.loadGalleryItem(
    {
      name: maybeLastParameter,
      src: props.fileUrl,
      fileType,
    },
    blogContext.getPostsQuery.data.value?.pages
      .flatMap((page) => page.rows)
      .reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>(
        (items, post) => [
          ...items,
          ...post.filesUrls.reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>(
            (accumulator, fileUrl) => {
              const maybeExtension = getFileUrlExtension(fileUrl);

              if (isNil(maybeExtension)) {
                return accumulator;
              }

              const fileType = extensionToFileType(maybeExtension);

              if (!(fileType === FILE_TYPES.IMAGE || fileType === FILE_TYPES.VIDEO)) {
                return accumulator;
              }

              const maybeLastParameter = getLastParameter(fileUrl);

              if (isNil(maybeLastParameter)) {
                return accumulator;
              }

              return [...accumulator, { name: maybeLastParameter, src: fileUrl, fileType }];
            },
            [],
          ),
        ],
        [],
      ) ?? [],
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
    case FILE_TYPES.IMAGE: {
      return {
        is: 'img',
        binds: {
          src: props.fileUrl,
          alt: t('attachmentN', { N: props.index + 1 }),
          onClick: loadToGallery,
        },
      };
    }
    case FILE_TYPES.AUDIO: {
      return {
        is: 'audio',
        binds: {
          src: props.fileUrl,
          controls: true,
        },
      };
    }
    case FILE_TYPES.VIDEO: {
      return {
        is: LazyPreviewVideo,
        binds: {
          src: props.fileUrl,
          onClick: loadToGallery,
        },
      };
    }
    default: {
      return {
        is: LazyAttachmentWithUnknownExtension,
        binds: pick(props, ['fileUrl']),
      };
    }
  }
});
</script>

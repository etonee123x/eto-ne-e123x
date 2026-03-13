<template>
  <component :is="component.is" class="max-w-full" v-bind="component.binds" @click.stop.prevent />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

import { useI18n } from 'vue-i18n';
import { useGallery } from '@/plugins/gallery';
import { useBlogContext } from '../contexts/blog';
import { FILE_TYPES } from '@/helpers/folderData';
import { propertyCurried } from '@etonee123x/shared/utils/property';
import type { components } from '@/types/openapi';

const LazyAttachmentWithUnknownExtension = defineAsyncComponent(() => {
  return import('./AttachmentWithUnknownExtension.vue');
});
const LazyBaseVideoPreview = defineAsyncComponent(() => {
  return import('@/components/ui/BaseVideoPreview.vue');
});

const props = defineProps<{
  attachment: components['schemas']['FolderDataItemFile'];
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

const loadToGallery = () => {
  if (!(props.attachment.fileType === FILE_TYPES.IMAGE || props.attachment.fileType === FILE_TYPES.VIDEO)) {
    return;
  }

  gallery.loadGalleryItem(
    props.attachment,
    blogContext.getPostsQuery.data.value?.pages
      .flatMap(propertyCurried('rows'))
      .reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>((items, post) => {
        return [
          ...items, //
          ...post.attachments.reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>(
            (accumulator, attachment) => {
              return attachment.fileType === FILE_TYPES.IMAGE || attachment.fileType === FILE_TYPES.VIDEO
                ? [...accumulator, attachment]
                : accumulator;
            },
            [],
          ),
        ];
      }, []) ?? [],
  );
};

const component = computed(() => {
  switch (props.attachment.fileType) {
    case FILE_TYPES.IMAGE: {
      return {
        is: 'img',
        binds: {
          src: props.attachment.src,
          width: props.attachment.metadata.width,
          height: props.attachment.metadata.height,
          alt: t('attachmentN', { N: props.index + 1 }),
          onClick: loadToGallery,
        },
      };
    }
    case FILE_TYPES.AUDIO: {
      return {
        is: 'audio',
        binds: {
          src: props.attachment.src,
          controls: true,
        },
      };
    }
    case FILE_TYPES.VIDEO: {
      return {
        is: LazyBaseVideoPreview,
        binds: {
          src: props.attachment.src,
          width: props.attachment.metadata.width,
          height: props.attachment.metadata.height,
          onClick: loadToGallery,
        },
      };
    }
    default: {
      return {
        is: LazyAttachmentWithUnknownExtension,
        binds: {
          attachment: props.attachment,
        },
      };
    }
  }
});
</script>

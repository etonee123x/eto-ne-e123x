<template>
  <component :is="component.is" class="max-w-full" v-bind="component.binds" @click.stop.prevent />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

import { useI18n } from 'vue-i18n';
import { FILE_TYPES, isFolderDataGalleryItem } from '@/helpers/folderData';
import type { components } from '@/types/openapi';
import { useGalleryItemContext } from '../contexts/galleryItem';

const galleryItemContext = useGalleryItemContext();

const LazyAttachmentWithUnknownExtension = defineAsyncComponent(() => {
  return import('./AttachmentWithUnknownExtension.vue');
});
const LazyBaseVideoPreview = defineAsyncComponent(() => {
  return import('@/components/ui/BaseVideoPreview.vue');
});

const props = defineProps<{
  attachment: components['schemas']['StoredFile'];
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

const loadToGallery = () => {
  if (!isFolderDataGalleryItem(props.attachment)) {
    return;
  }

  galleryItemContext.value = props.attachment;
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

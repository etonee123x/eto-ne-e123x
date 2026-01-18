<template>
  <component :is="component.is" class="max-w-full" v-bind="component.binds" @click.stop.prevent />
</template>

<script setup lang="ts">
import { pick } from '@etonee123x/shared/utils/pick';
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
const LazyPreviewVideo = defineAsyncComponent(() => {
  return import('@/components/PreviewVideo.vue');
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
    pick(props.attachment, ['name', 'src', 'fileType']),
    blogContext.getPostsQuery.data.value?.pages
      .flatMap(propertyCurried('rows'))
      .reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>((items, post) => {
        return [
          ...items, //
          ...post.attachments.reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>(
            (accumulator, attachment) => {
              return attachment.fileType === FILE_TYPES.IMAGE || attachment.fileType === FILE_TYPES.VIDEO
                ? [...accumulator, pick(attachment, ['name', 'src', 'fileType'])]
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
        is: LazyPreviewVideo,
        binds: {
          src: props.attachment.src,
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

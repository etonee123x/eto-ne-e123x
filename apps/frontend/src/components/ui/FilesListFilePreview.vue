<template>
  <component :is="component.is" v-bind="component.binds" />
</template>

<script setup lang="ts">
import { extensionToFileType, FILE_TYPES } from '@/helpers/folderData';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { mdiFileOutline } from '@mdi/js';
import { defineAsyncComponent, computed } from 'vue';

const LazyBaseIcon = defineAsyncComponent(() => {
  return import('@/components/ui/BaseIcon');
});
const LazyPreviewVideo = defineAsyncComponent(() => {
  return import('@/components/PreviewVideo.vue');
});

const props = defineProps<{ file: File }>();

const component = computed(() => {
  const extension = /^[^/]+\/(?<extension>.*)$/.exec(props.file.type)?.groups?.extension;

  const unknownComponent = {
    is: LazyBaseIcon,
    binds: {
      path: mdiFileOutline,
      size: '2rem',
    },
  };

  if (isNil(extension)) {
    return unknownComponent;
  }

  switch (extensionToFileType(`.${extension}`)) {
    case FILE_TYPES.IMAGE: {
      return {
        is: 'img',
        binds: {
          src: URL.createObjectURL(props.file),
          style: {
            maxWidth: '10rem',
            maxHeight: '10rem',
            objectFit: 'contain',
          },
        },
      };
    }
    case FILE_TYPES.AUDIO: {
      return {
        is: 'audio',
        binds: {
          src: URL.createObjectURL(props.file),
          controls: true,
        },
      };
    }
    case FILE_TYPES.VIDEO: {
      return {
        is: LazyPreviewVideo,
        binds: {
          src: URL.createObjectURL(props.file),
          controls: true,
          style: {
            maxWidth: '10rem',
            maxHeight: '10rem',
          },
        },
      };
    }
    default: {
      return unknownComponent;
    }
  }
});
</script>

<template>
  <ol class="flex gap-4 flex-col" ref="ol">
    <li v-for="(file, index) in model" class="flex items-center gap-2" :key="fileToKey(file)">
      <component :is="fileToComponent(file)" />
      <BaseAlwaysScrollable duration="10000ms" class="flex-1">
        {{ file.name }}
      </BaseAlwaysScrollable>
      <div class="text-2xl flex gap-2 ms-auto items-center">
        <!-- TODO: переместить -->
        <BaseIcon class="cursor-grab" :class="CLASS_HANDLE" :path="mdiSwapVertical" />
        <BaseButton @click="() => onClickDeteleByIndex(index)">
          <BaseIcon :path="mdiClose" />
        </BaseButton>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { mdiClose, mdiFileOutline, mdiSwapVertical } from '@mdi/js';
import { isNil } from '@etonee123x/shared/utils/isNil';
import Sortable from 'sortablejs';
import { defineAsyncComponent, useTemplateRef, watch, h } from 'vue';

import BaseIcon from '@/components/ui/BaseIcon.vue';
import BaseAlwaysScrollable from '@/components/ui/BaseAlwaysScrollable.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { extensionToFileType, FILE_TYPES } from '@/helpers/folderData';
import { nonNullable } from '@/utils/nonNullable';
import type { components } from '@/types/openapi';

type FileOrFolderDataItemFile = File | components['schemas']['FolderDataItemFile'];

const LazyBaseIcon = defineAsyncComponent(() => {
  return import('@/components/ui/BaseIcon.vue');
});

const PreviewUnknown = () => {
  return h(LazyBaseIcon, { path: mdiFileOutline, size: '2rem' });
};

const PreviewImage = (file: FileOrFolderDataItemFile) => {
  return h('img', {
    src: fileToSrc(file),
    style: {
      maxWidth: '10rem',
      maxHeight: '10rem',
      objectFit: 'contain',
    },
  });
};

const PreviewAudio = (file: FileOrFolderDataItemFile) => {
  return h('audio', {
    src: fileToSrc(file),
    controls: true,
  });
};

const PreviewVideo = (file: FileOrFolderDataItemFile) => {
  return h('video', {
    src: fileToSrc(file),
    controls: true,
    style: {
      maxWidth: '10rem',
      maxHeight: '10rem',
    },
  });
};

const isFile = (fileOrFolderDataItemFile: FileOrFolderDataItemFile): fileOrFolderDataItemFile is File => {
  return fileOrFolderDataItemFile instanceof File;
};

// новояз
// eslint-disable-next-line unicorn/prevent-abbreviations
const fileToSrc = (file: FileOrFolderDataItemFile) => {
  if (isFile(file)) {
    return URL.createObjectURL(file);
  }

  return file.src;
};

const CLASS_HANDLE = '_handle';

const model = defineModel<Array<FileOrFolderDataItemFile>>({ required: true });

const ol = useTemplateRef('ol');
let sortable: null | Sortable = null;

const onClickDeteleByIndex = (index: number) => {
  model.value = model.value.toSpliced(index, 1);
};

const fileToKey = (file: FileOrFolderDataItemFile) => {
  return isFile(file)
    ? [file.name, file.type, file.lastModified, file.size].join('-')
    : [file.name, file.src].join('-');
};

const fileToComponent = (file: FileOrFolderDataItemFile) => {
  const type = isFile(file)
    ? extensionToFileType(`.${nonNullable(/^[^/]+\/(?<extension>.*)$/.exec(file.type)?.groups?.extension)}`)
    : file.fileType;

  switch (type) {
    case FILE_TYPES.IMAGE: {
      return PreviewImage(file);
    }
    case FILE_TYPES.AUDIO: {
      return PreviewAudio(file);
    }
    case FILE_TYPES.VIDEO: {
      return PreviewVideo(file);
    }
    default: {
      return PreviewUnknown();
    }
  }
};

watch(ol, () => {
  if (!ol.value) {
    sortable?.destroy();
    sortable = null;
    return;
  }

  sortable = Sortable.create(ol.value, {
    handle: `.${CLASS_HANDLE}`,
    onEnd: (event) => {
      if (isNil(event.oldIndex) || isNil(event.newIndex) || event.newIndex === event.oldIndex) {
        return;
      }

      // TODO: заменить на toSpliced, проверить внимательно
      model.value.splice(event.newIndex, 0, ...model.value.splice(event.oldIndex, 1));
    },
  });
});
</script>

<template>
  <ElementFileWrapper :element :to>
    <ul class="flex gap-4 overflow-x-auto">
      <li
        v-for="metadataItem in metadataItems"
        :title="metadataItem.title"
        class="flex flex-col items-center"
        :key="metadataItem.key"
      >
        <BaseIcon class="text-2xl h-6" :path="metadataItem.path" />
        <span class="text-center max-w-40">
          {{ metadataItem.value }}
        </span>
      </li>
    </ul>
  </ElementFileWrapper>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { mdiClockOutline, mdiAccountOutline, mdiAlbum, mdiCalendarBlankOutline, mdiMetronome } from '@mdi/js';

import ElementFileWrapper from './_ElementFileWrapper.vue';
import type { Props as PropsElementFileWrapper } from './_ElementFileWrapper.vue';

import { millisecondsToHumanReadable } from '@/utils/millisecondsToHumanReadable';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import type { components } from '@/types/openapi';

const props = defineProps<{
  element: components['schemas']['FolderDataItemAudio'];
  to: PropsElementFileWrapper['to'];
}>();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      duration: 'Длительность',
      artists: 'Исполнитель(-и)',
      album: 'Альбом',
      year: 'Год выхода',
      bpm: 'Темп',
    },
    en: {
      duration: 'Duration',
      artists: 'Artist(-s)',
      album: 'Album',
      year: 'Release year',
      bpm: 'BPM',
    },
  },
});

const metadataItems = computed(() => {
  return [
    ...(props.element.metadata.duration
      ? [
          {
            key: 'duration',
            title: t('duration'),
            path: mdiClockOutline,
            value: millisecondsToHumanReadable(props.element.metadata.duration),
          },
        ]
      : []),
    ...(props.element.metadata.artists.length > 0
      ? [
          {
            key: 'artists',
            title: t('artists'),
            path: mdiAccountOutline,
            value: props.element.metadata.artists.join(' & '),
          },
        ]
      : []),
    ...(props.element.metadata.album
      ? [
          {
            key: 'album',
            title: t('album'),
            path: mdiAlbum,
            value: props.element.metadata.album,
          },
        ]
      : []),
    ...(props.element.metadata.year
      ? [
          {
            key: 'year',
            title: t('year'),
            path: mdiCalendarBlankOutline,
            value: String(props.element.metadata.year),
          },
        ]
      : []),
    ...(props.element.metadata.bpm
      ? [
          {
            key: 'bpm',
            title: t('bpm'),
            path: mdiMetronome,
            value: String(props.element.metadata.bpm),
          },
        ]
      : []),
  ];
});
</script>

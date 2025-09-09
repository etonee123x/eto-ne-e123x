<template>
  <BaseSwipable
    data-player
    class="bg-background z-player shadow-[0_-2px_4px_0_rgba(34,60,80,0.2)] py-2 w-full"
    @swiped="onSwiped"
  >
    <div class="layout-container mx-auto flex flex-col gap-1 justify-center">
      <component
        :is="ComponentClose"
        v-if="shouldRenderButtonClose"
        class="text-xl absolute end-2 top-2 hover-none:hidden"
        :aria-label="t('closePlayer')"
        @click="onClickClose"
      >
        <BaseIcon :path="mdiClose" />
      </component>
      <BaseAlwaysScrollable class="[--base-always-scrollable--content--margin:0_auto]">
        <header
          class="cursor-pointer flex items-start gap-0.5 border-b border-b-dark border-dashed"
          :title="t('copyLink')"
          @click="onClickTitle"
        >
          <h2>{{ playerStore.theTrack?.name }}</h2>
          <BaseIcon :path="mdiLinkVariant" />
        </header>
      </BaseAlwaysScrollable>
      <audio :src="playerStore.theTrack?.src" autoplay ref="audio" @ended="onEnded" />
      <div class="h-5 w-full mx-auto flex justify-between items-center gap-2">
        <time :datetime="currentTimeFormats.iso">
          {{ currentTimeFormats.humanReadable }}
        </time>
        <PlayerSlider
          :multiplier="duration / 1000"
          isLazy
          v-model="currentTimeSeconds"
          @keydown.right="onKeyDownRightTime"
          @keydown.left="onKeyDownLeftTime"
        />
        <time :datetime="durationFormats.iso">
          {{ durationFormats.humanReadable }}
        </time>
      </div>
      <div class="grid grid-cols-[1fr_min-content_1fr] grid-areas-['left_center_right'] gap-x-4 items-center">
        <BaseToggler
          class="whitespace-nowrap min-w-6 justify-self-end"
          :aria-label="playerStore.isShuffleModeEnabled ? t('disableShuffleTracks') : t('enableShuffleTracks')"
          v-model="playerStore.isShuffleModeEnabled"
        >
          <BaseIcon class="text-2xl" :path="mdiShuffleVariant" />
        </BaseToggler>
        <ul class="flex justify-center gap-2">
          <li v-for="controlButton in controlButtons" :key="controlButton.key">
            <BaseButton
              :isDisabled="controlButton.isDisabled"
              class="whitespace-nowrap min-w-6 h-6 w-8"
              :aria-label="controlButton.ariaLabel"
              @click="controlButton.onClick"
            >
              <BaseIcon class="text-2xl" :path="controlButton.icon" />
            </BaseButton>
          </li>
        </ul>
        <div class="flex h-full w-5/6 max-w-20 items-center">
          <PlayerSlider v-model="volume" @keydown.right="onKeyDownRightVolume" @keydown.left="onKeyDownLeftVolume" />
        </div>
      </div>
    </div>
  </BaseSwipable>
</template>

<script lang="ts" setup>
import { useClipboard, useMediaControls, useToggle } from '@vueuse/core';
import {
  mdiClose,
  mdiShuffleVariant,
  mdiLinkVariant,
  mdiPause,
  mdiPlay,
  mdiSkipBackward,
  mdiSkipForward,
} from '@mdi/js';
import { computed, useTemplateRef, h } from 'vue';
import { useI18n } from 'vue-i18n';

import PlayerSlider from './components/PlayerSlider.vue';

import BaseButton from '@/components/ui/BaseButton';
import BaseIcon from '@/components/ui/BaseIcon';
import BaseSwipable from '@/components/ui/BaseSwipable.vue';
import BaseToggler from '@/components/ui/BaseToggler.vue';
import { usePlayerStore } from '@/stores/player';
import { useToastsStore } from '@/stores/toasts';
import { millisecondsToHumanReadable } from '@/utils/millisecondsToHumanReadable';
import { to0To1Borders } from '@/utils/to0To1Borders';
import BaseAlwaysScrollable from '@/components/ui/BaseAlwaysScrollable.vue';
import { Temporal } from '@js-temporal/polyfill';
import { useExplorerStore } from '@/stores/explorer';
import { useRoute, RouterLink } from 'vue-router';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { BUTTON } from '@/helpers/ui';
import { nonNullable } from '@/utils/nonNullable';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    Ru: {
      copied: 'Скопировано!',
      copyLink: 'Скопировать ссылку',
      previousTrack: 'Предыдущий трек',
      pauseTrack: 'Пауза трека',
      playTrack: 'Воспроизвести трек',
      nextTrack: 'Следующий трек',
      closePlayer: 'Закрыть плеер',
      enableShuffleTracks: 'Включить перемешивание треков',
      disableShuffleTracks: 'Выключить перемешивание треков',
    },
    En: {
      copied: 'Copied!',
      copyLink: 'Copy link',
      previousTrack: 'Previous track',
      pauseTrack: 'Pause track',
      playTrack: 'Play track',
      nextTrack: 'Next track',
      closePlayer: 'Close player',
      enableShuffleTracks: 'Enable shuffle tracks',
      disableShuffleTracks: 'Disable shuffle tracks',
    },
  },
});

const route = useRoute();

const explorerStore = useExplorerStore();
const playerStore = usePlayerStore();
const toastsStore = useToastsStore();

const audio = useTemplateRef('audio');

const { playing: isPlaying, waiting: isWaiting, currentTime: currentTimeSeconds, volume } = useMediaControls(audio);
const duration = computed(() => playerStore.theTrack?.musicMetadata.duration ?? 0);

const toggleIsPlaying = useToggle(isPlaying);

const shouldRenderButtonClose = computed(() => !(isPlaying.value || isWaiting.value));

const controlButtons = computed(() => [
  {
    key: 'previous',
    icon: mdiSkipBackward,
    onClick: playerStore.loadPrev,
    isDisabled: playerStore.isShuffleModeEnabled && playerStore.historyItems.length === 0,
    ariaLabel: t('previousTrack'),
  },
  isPlaying.value
    ? {
        key: 'pause',
        icon: mdiPause,
        onClick: () => toggleIsPlaying(false),
        ariaLabel: t('pauseTrack'),
      }
    : {
        key: 'play',
        icon: mdiPlay,
        onClick: () => toggleIsPlaying(true),
        ariaLabel: t('playTrack'),
      },
  {
    key: 'next',
    icon: mdiSkipForward,
    onClick: playerStore.loadNext,
    ariaLabel: t('nextTrack'),
  },
]);

const onEnded = playerStore.loadNext;

const ComponentClose = computed(() => {
  if (isNil(playerStore.theTrack?.url)) {
    return BaseButton;
  }

  const maybeFolderData = explorerStore.routePathToFolderData[route.fullPath];
  const maybeFolderDataLinkedFile = maybeFolderData?.linkedFile;

  if (!maybeFolderDataLinkedFile) {
    return BaseButton;
  }

  const lastNavigationItem = maybeFolderData.navigationItems.at(-1);

  if (!lastNavigationItem) {
    return BaseButton;
  }

  return playerStore.playlist.some((track) => track.src === maybeFolderDataLinkedFile.src)
    ? h(RouterLink, { to: lastNavigationItem.link, class: BUTTON.default })
    : BaseButton;
});

const unloadTrack = () => {
  playerStore.theTrack = null;
};

const onClickClose = unloadTrack;
const onSwiped = unloadTrack;

const { copy } = useClipboard({
  source: () => {
    let _url = [globalThis.location.origin, nonNullable(playerStore.theTrack).url].join('');

    try {
      _url = encodeURI(_url);
    } catch (e) {
      console.error(e);
    }

    return _url;
  },
  legacy: true,
});

const onClickTitle = () => copy().then(() => toastsStore.toastSuccess(t('copied')));

const onKeyDownRightTime = () => {
  currentTimeSeconds.value += 5;
};

const onKeyDownLeftTime = () => {
  currentTimeSeconds.value -= 5;
};

const onKeyDownRightVolume = () => {
  volume.value = to0To1Borders(volume.value + 0.05);
};

const onKeyDownLeftVolume = () => {
  volume.value = to0To1Borders(volume.value - 0.05);
};

const millisecondsToTimeFormats = (milliseconds: number) => ({
  humanReadable: millisecondsToHumanReadable(milliseconds),
  iso: Temporal.Duration.from({ milliseconds: Math.ceil(milliseconds) }).toString(),
});

const currentTimeFormats = computed(() => millisecondsToTimeFormats(currentTimeSeconds.value * 1000));
const durationFormats = computed(() => millisecondsToTimeFormats(duration.value));
</script>

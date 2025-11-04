<template>
  <BaseSwipable
    data-player
    class="bg-background z-player shadow-[0_-2px_4px_0_rgba(34,60,80,0.2)] py-2 w-full"
    @swiped="onSwiped"
  >
    <div class="layout-container flex flex-col gap-1 justify-center">
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
          <h2>{{ player.theTrack.value?.name }}</h2>
          <BaseIcon :path="mdiLinkVariant" />
        </header>
      </BaseAlwaysScrollable>
      <audio :src="player.theTrack.value?.src" autoplay ref="audio" @ended="onEnded" />
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
          :aria-label="isShuffleModeEnabled ? t('disableShuffleTracks') : t('enableShuffleTracks')"
          v-model="isShuffleModeEnabled"
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
        <ClientOnly v-if="!isMobile">
          <div class="flex h-full w-5/6 max-w-20 items-center">
            <PlayerSlider v-model="volume" @keydown.right="onKeyDownRightVolume" @keydown.left="onKeyDownLeftVolume" />
          </div>
        </ClientOnly>
      </div>
    </div>
  </BaseSwipable>
</template>

<script lang="ts" setup>
import { syncRef, useClipboard, useLocalStorage, useMediaControls, useToggle } from '@vueuse/core';
import {
  mdiClose,
  mdiShuffleVariant,
  mdiLinkVariant,
  mdiPause,
  mdiPlay,
  mdiSkipBackward,
  mdiSkipForward,
} from '@mdi/js';
import { computed, useTemplateRef, h, shallowReactive } from 'vue';
import { useI18n } from 'vue-i18n';

import PlayerSlider from './components/PlayerSlider.vue';

import BaseButton from '@/components/ui/BaseButton';
import BaseIcon from '@/components/ui/BaseIcon';
import BaseSwipable from '@/components/ui/BaseSwipable.vue';
import BaseToggler from '@/components/ui/BaseToggler.vue';
import { millisecondsToHumanReadable } from '@/utils/millisecondsToHumanReadable';
import { to0To1Borders } from '@/utils/to0To1Borders';
import BaseAlwaysScrollable from '@/components/ui/BaseAlwaysScrollable.vue';
import { Temporal } from 'temporal-polyfill';
import { RouterLink, useRouter } from 'vue-router';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { BUTTON } from '@/helpers/ui';
import { nonNullable } from '@/utils/nonNullable';
import { useIsMobile } from '@/composables/useIsMobile';
import ClientOnly from '../ClientOnly.vue';
import { NOTIFICATION_TYPES, useNotifications } from '@/plugins/notifications';
import { getRandomExceptCurrentIndex } from '@/utils/getRandomExceptCurrentIndex';
import { usePlayer } from '@/plugins/player';
import { useExplorerContext } from '@/views/Explorer/contexts/explorer';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
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
    en: {
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

const historyItems = shallowReactive<Array<number>>([]);
const [isShuffleModeEnabled] = useToggle();
const currentPlayingNumber = computed({
  get: () => player.playlist.value.findIndex((playlistItem) => playlistItem.src === player.theTrack.value?.src),
  set: (value) => {
    player.theTrack.value = player.playlist.value[value] ?? null;
  },
});

const isMobile = useIsMobile();

const router = useRouter();

const explorerContext = useExplorerContext();
const player = usePlayer();
const notifications = useNotifications();

const audio = useTemplateRef('audio');

const volumeLocalStorage = useLocalStorage('player-volume', 1);
const { playing: isPlaying, waiting: isWaiting, currentTime: currentTimeSeconds, volume } = useMediaControls(audio);

if (isMobile) {
  volume.value = 1;
} else {
  syncRef(volumeLocalStorage, volume);
}

const duration = computed(() => player.theTrack.value?.musicMetadata.duration ?? 0);

const toggleIsPlaying = useToggle(isPlaying);

const shouldRenderButtonClose = computed(() => !(isPlaying.value || isWaiting.value));

const load = {
  next: () => {
    historyItems.push(currentPlayingNumber.value);

    currentPlayingNumber.value = isShuffleModeEnabled.value
      ? getRandomExceptCurrentIndex(player.playlist.value.length, currentPlayingNumber.value)
      : (currentPlayingNumber.value + 1) % player.playlist.value.length;
  },
  previous: () => {
    currentPlayingNumber.value =
      historyItems.length > 0
        ? (historyItems.pop() ?? 0)
        : (currentPlayingNumber.value - 1 + player.playlist.value.length) % player.playlist.value.length;
  },
};

const controlButtons = computed(() => [
  {
    key: 'previous',
    icon: mdiSkipBackward,
    onClick: load.previous,
    isDisabled: isShuffleModeEnabled.value && historyItems.length === 0,
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
    onClick: load.next,
    ariaLabel: t('nextTrack'),
  },
]);

const onEnded = load.next;

const ComponentClose = computed(() => {
  const to = toOnClose();

  return to ? h(RouterLink, { to, class: BUTTON.default }) : BaseButton;
});

const toOnClose = () => {
  if (isNil(player.theTrack.value?.url)) {
    return;
  }

  const currentFolderData = explorerContext.currentFolderData();

  const maybeFolderDataLinkedFile = currentFolderData?.linkedFile;

  if (!maybeFolderDataLinkedFile) {
    return;
  }

  const lastNavigationItem = currentFolderData.navigationItems.at(-1);

  if (!lastNavigationItem) {
    return;
  }

  if (!player.playlist.value.some((track) => track.src === maybeFolderDataLinkedFile.src)) {
    return;
  }

  return lastNavigationItem.link;
};

const unloadTrack = () => {
  player.theTrack.value = null;

  // Такой вот костыль... Нужен чтобы выгрузить текущий трек из управления аудио.
  // Без этого при закрытии плеера и нажатии на кнопку play/pause будет играть/останавливаться трек.
  audio.value?.load();
};

const onClickClose = unloadTrack;

const onSwiped = () => {
  const to = toOnClose();

  if (isNil(to)) {
    return;
  }

  router.push(to).then(unloadTrack);
};

const { copy } = useClipboard({
  source: () => {
    let _url = [globalThis.location.origin, nonNullable(player.theTrack.value).url].join('');

    try {
      _url = encodeURI(_url);
    } catch (error) {
      console.error(error);
    }

    return _url;
  },
  legacy: true,
});

const onClickTitle = () => copy().then(() => notifications.notify(t('copied'), { type: NOTIFICATION_TYPES.SUCCESS }));

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

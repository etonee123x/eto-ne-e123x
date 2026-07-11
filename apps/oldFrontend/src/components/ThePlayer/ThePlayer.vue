<template>
  <BaseSwipable
    data-player
    class="bg-background z-player border-t border-primary-500 pt-2 pb-4 w-full"
    @swiped="onSwiped"
  >
    <div class="layout-container flex flex-col gap-2 justify-center">
      <BaseButton
        v-if="shouldRenderButtonClose"
        class="text-xl absolute inset-e-2 top-2 hover-none:hidden"
        :aria-label="t('closePlayer')"
        @click="onClickClose"
      >
        <BaseIcon :path="mdiClose" />
      </BaseButton>
      <BaseAlwaysScrollable class="[--base-always-scrollable--content--margin:0_auto]">
        <header class="flex items-center gap-2 text-lg">
          <h2>{{ player.theTrack.value?.name }}</h2>
          <BaseButton :aria-label="t('copyLink')" class="p-1" @click="onClickTitle">
            <BaseIcon :path="mdiLinkVariant" />
          </BaseButton>
        </header>
      </BaseAlwaysScrollable>
      <audio :src="player.theTrack.value?.src" autoplay :onEnded ref="audio" />
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
              :disabled="controlButton.disabled"
              class="whitespace-nowrap h-full w-8"
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
import { identity, syncRef, useClipboard, useLocalStorage, useMediaControls, useToggle } from '@vueuse/core';
import {
  mdiClose,
  mdiShuffleVariant,
  mdiLinkVariant,
  mdiPause,
  mdiPlay,
  mdiSkipBackward,
  mdiSkipForward,
} from '@mdi/js';
import { computed, useTemplateRef, shallowReactive, onScopeDispose, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import PlayerSlider from './components/PlayerSlider.vue';

import BaseButton from '@/components/ui/BaseButton.vue';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import BaseSwipable from '@/components/ui/BaseSwipable.vue';
import BaseToggler from '@/components/ui/BaseToggler.vue';
import { millisecondsToHumanReadable } from '@/utils/millisecondsToHumanReadable';
import { to0To1Borders } from '@/utils/to0To1Borders';
import BaseAlwaysScrollable from '@/components/ui/BaseAlwaysScrollable.vue';
import { Temporal } from 'temporal-polyfill';
import { nonNullable } from '@/utils/nonNullable';
import { useIsMobile } from '@/composables/useIsMobile';
import ClientOnly from '../ClientOnly.vue';
import { NOTIFICATION_TYPES, useNotifications } from '@/plugins/notifications';
import { getRandomExceptCurrentIndex } from '@/utils/getRandomExceptCurrentIndex';
import { usePlayer } from '@/plugins/player';
import { useL10n } from '@/composables/useL10n';

const l10n = useL10n();

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
  get: () => {
    return player.playlist.value.tracks.findIndex((playlistItem) => {
      return playlistItem.src === player.theTrack.value?.src;
    });
  },
  set: (value) => {
    player.theTrack.value = player.playlist.value.tracks[value] ?? null;
  },
});

const isMobile = useIsMobile();

const player = reactive(usePlayer());
const notifications = useNotifications();

const audio = useTemplateRef('audio');

const volumeLocalStorage = useLocalStorage('player-volume', 1);
const { playing: isPlaying, waiting: isWaiting, currentTime: currentTimeSeconds, volume } = useMediaControls(audio);

if (isMobile) {
  volume.value = 1;
} else {
  syncRef(volumeLocalStorage, volume, { transform: { ltr: identity, rtl: identity } });
}

const duration = computed(() => {
  return player.theTrack.value?.metadata.duration ?? 0;
});

const toggleIsPlaying = useToggle(isPlaying);

const shouldRenderButtonClose = computed(() => {
  return !(isPlaying.value || isWaiting.value);
});

const load = {
  next: () => {
    historyItems.push(currentPlayingNumber.value);

    currentPlayingNumber.value = isShuffleModeEnabled.value
      ? getRandomExceptCurrentIndex(player.playlist.value.tracks.length, currentPlayingNumber.value)
      : (currentPlayingNumber.value + 1) % player.playlist.value.tracks.length;
  },
  previous: () => {
    currentPlayingNumber.value =
      historyItems.length > 0
        ? (historyItems.pop() ?? 0)
        : (currentPlayingNumber.value - 1 + player.playlist.value.tracks.length) % player.playlist.value.tracks.length;
  },
};

const controlButtons = computed(() => {
  return [
    {
      key: 'previous',
      icon: mdiSkipBackward,
      onClick: load.previous,
      disabled: isShuffleModeEnabled.value && historyItems.length === 0,
      ariaLabel: t('previousTrack'),
    },
    isPlaying.value
      ? {
          key: 'pause',
          icon: mdiPause,
          onClick: () => {
            return toggleIsPlaying(false);
          },
          ariaLabel: t('pauseTrack'),
        }
      : {
          key: 'play',
          icon: mdiPlay,
          onClick: () => {
            return toggleIsPlaying(true);
          },
          ariaLabel: t('playTrack'),
        },
    {
      key: 'next',
      icon: mdiSkipForward,
      onClick: load.next,
      ariaLabel: t('nextTrack'),
    },
  ];
});

const onEnded = load.next;

const reloadAudio = () => {
  // Такой вот костыль... Нужен чтобы выгрузить текущий трек из управления аудио.
  // Без этого при закрытии плеера и нажатии на кнопку play/pause будет играть/останавливаться трек.
  audio.value?.load();
};

player.hooksOnUnload.after.add(reloadAudio);
onScopeDispose(() => {
  player.hooksOnUnload.after.delete(reloadAudio);
});

const onClickClose = player.unload;
const onSwiped = player.unload;

const clipboard = useClipboard({
  source: () => {
    return encodeURI(
      new URL(
        l10n.localizePath(['explorer', nonNullable(player.theTrack.value).path].join('/')),
        globalThis.location.origin,
      ).toString(),
    );
  },
  legacy: true,
});

const onClickTitle = async () => {
  await clipboard.copy();
  notifications.notify(t('copied'), { type: NOTIFICATION_TYPES.SUCCESS });
};

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

const millisecondsToTimeFormats = (milliseconds: number) => {
  return {
    humanReadable: millisecondsToHumanReadable(milliseconds),
    iso: Temporal.Duration.from({ milliseconds: Math.ceil(milliseconds) }).toString(),
  };
};

const currentTimeFormats = computed(() => {
  return millisecondsToTimeFormats(currentTimeSeconds.value * 1000);
});
const durationFormats = computed(() => {
  return millisecondsToTimeFormats(duration.value);
});
</script>

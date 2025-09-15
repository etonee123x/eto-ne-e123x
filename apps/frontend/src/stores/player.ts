import type { ItemAudio } from '@etonee123x/shared/helpers/folderData';
import { defineStore } from 'pinia';
import { ref, shallowReactive, shallowRef } from 'vue';

import { getRandomExceptCurrentIndex } from '@/utils/getRandomExceptCurrentIndex';

export const usePlayerStore = defineStore('player', () => {
  const theTrack = shallowRef<ItemAudio | null>(null);

  const currentPlayingNumber = ref(0);

  const playlist = ref<Array<ItemAudio>>([]);

  const historyItems = shallowReactive<Array<number>>([]);

  const isShuffleModeEnabled = ref(false);

  const loadNext = () => {
    historyItems.push(currentPlayingNumber.value);

    currentPlayingNumber.value = isShuffleModeEnabled.value
      ? getRandomExceptCurrentIndex(playlist.value.length, currentPlayingNumber.value)
      : (currentPlayingNumber.value + 1) % playlist.value.length;

    theTrack.value = playlist.value[currentPlayingNumber.value] ?? null;
  };

  const loadPrev = () => {
    currentPlayingNumber.value =
      historyItems.length > 0
        ? (historyItems.pop() ?? 0)
        : (currentPlayingNumber.value - 1 + playlist.value.length) % playlist.value.length;

    theTrack.value = playlist.value[currentPlayingNumber.value] ?? null;
  };

  return {
    historyItems,
    currentPlayingNumber,
    playlist,
    theTrack,
    isShuffleModeEnabled,

    loadPrev,
    loadNext,
  };
});

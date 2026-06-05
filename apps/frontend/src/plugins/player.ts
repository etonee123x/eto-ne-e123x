import { useResetableRef } from '@/composables/useResetableRef';
import { isClient } from '@/constants/target';
import type { components } from '@/types/openapi';
import { getRandomExceptCurrentIndex } from '@/utils/getRandomExceptCurrentIndex';
import { nonNullable } from '@/utils/nonNullable';
import { objectGet } from '@etonee123x/shared/utils/objectGet';
import { useEventListener, useToggle } from '@vueuse/core';
import { computed, inject, reactive, shallowReactive, watch } from 'vue';
import type { FunctionPlugin, InjectionKey, Reactive, Ref, ShallowReactive } from 'vue';

interface Context {
  theTrack: Reactive<ReturnType<typeof useResetableRef<components['schemas']['FolderDataItemAudio'] | null>>>;
  playlist: Reactive<
    ReturnType<
      typeof useResetableRef<{
        tracks: Array<components['schemas']['FolderDataItemAudio']>;
        pathDirectory: string | null;
      }>
    >
  >;
  unload: () => Promise<boolean>;
  hooksOnUnload: {
    before: Set<() => void | boolean | Promise<void | boolean>>;
    after: Set<() => void>;
  };
  audio: HTMLAudioElement | null;
  load: {
    next: () => void;
    previous: () => void;
  };
  isShuffleModeEnabled: Ref<boolean>;
  historyItems: ShallowReactive<Array<number>>;
}

const INJECTION_KEY: InjectionKey<Context> = Symbol('player');

export const createPlayer = () => {
  const theTrack: Context['theTrack'] = reactive(useResetableRef(null));
  const playlist: Context['playlist'] = reactive(
    useResetableRef({
      tracks: [],
      pathDirectory: null,
    }),
  );

  const hooksOnUnload: Context['hooksOnUnload'] = {
    before: new Set(),
    after: new Set(),
  };

  const unload: Context['unload'] = async () => {
    for (const hook of hooksOnUnload.before) {
      const result = await hook();

      if (result === false) {
        return false;
      }
    }

    theTrack.reset();
    playlist.reset();

    for (const hook of hooksOnUnload.after) {
      hook();
    }

    return true;
  };

  let audio: HTMLAudioElement | null = null;

  if (isClient) {
    audio = new Audio();

    useEventListener(audio, 'ended', () => {
      load.next();
    });

    watch(
      () => {
        return theTrack.value?.src;
      },
      () => {
        if (!audio) {
          return;
        }

        if (!theTrack.value?.src) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();

          return;
        }

        audio.src = theTrack.value.src;
        audio.play().catch(() => {
          return null;
        });
      },
    );
  }

  const [isShuffleModeEnabled] = useToggle();

  const currentPlayingNumber = computed({
    get: () => {
      return playlist.value.tracks.findIndex((playlistItem) => {
        return playlistItem.src === theTrack.value?.src;
      });
    },
    set: (value) => {
      theTrack.value = playlist.value.tracks[value] ?? null;
    },
  });

  const historyItems = shallowReactive<Array<number>>([]);

  const load = {
    next: () => {
      historyItems.push(currentPlayingNumber.value);

      currentPlayingNumber.value = isShuffleModeEnabled.value
        ? getRandomExceptCurrentIndex(playlist.value.tracks.length, currentPlayingNumber.value)
        : (currentPlayingNumber.value + 1) % playlist.value.tracks.length;
    },
    previous: () => {
      currentPlayingNumber.value =
        historyItems.length > 0
          ? (historyItems.pop() ?? 0)
          : (currentPlayingNumber.value - 1 + playlist.value.tracks.length) % playlist.value.tracks.length;
    },
  };

  const install: FunctionPlugin = (app) => {
    app.provide(INJECTION_KEY, {
      theTrack,
      playlist,
      unload,
      hooksOnUnload,
      audio,
      load,
      isShuffleModeEnabled,
      historyItems,
    });
  };

  const init = () => {
    // нет, правда, давайте считать, что так оно и будет!
    /* eslint-disable @typescript-eslint/no-explicit-any */
    theTrack.value = objectGet(globalThis.__PLAYER__, 'theTrack') as any;
    playlist.value = objectGet(globalThis.__PLAYER__, 'playlist') as any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  return {
    install,
    init,

    state: computed(() => {
      return {
        theTrack: theTrack.value,
        playlist: playlist.value,
      };
    }),
  };
};

export const usePlayer = () => {
  return nonNullable(inject(INJECTION_KEY));
};

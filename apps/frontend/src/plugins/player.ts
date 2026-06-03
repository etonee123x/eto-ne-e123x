import { useResetableRef } from '@/composables/useResetableRef';
import { isClient } from '@/constants/target';
import type { components } from '@/types/openapi';
import { getRandomExceptCurrentIndex } from '@/utils/getRandomExceptCurrentIndex';
import { nonNullable } from '@/utils/nonNullable';
import { objectGet } from '@etonee123x/shared/utils/objectGet';
import { useEventListener, useToggle } from '@vueuse/core';
import { computed, inject, reactive, ref, shallowReactive, watch } from 'vue';
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
  buffer: Ref<Uint8Array>;
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

  const buffer = ref(new Uint8Array(32));

  let audio: HTMLAudioElement | null = null;

  if (isClient) {
    audio = new Audio();

    let audioContext: AudioContext | null = null;
    let sourceNode: MediaElementAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;

    let frameId: number | null = null;

    useEventListener(audio, 'ended', () => {
      load.next();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useEventListener(audio, 'play', async () => {
      if (!audioContext) {
        return;
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const loop = () => {
        analyser?.getByteFrequencyData(buffer.value);
        frameId = requestAnimationFrame(loop);
      };

      loop();
    });

    const cleanup = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      audioContext?.suspend();
    };

    useEventListener(audio, 'pause', cleanup);

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

          cleanup();

          return;
        }

        audio.src = theTrack.value.src;
        audio.play().catch(() => {
          return null;
        });

        if (audioContext) {
          return;
        }

        audioContext = new AudioContext();

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;

        sourceNode = audioContext.createMediaElementSource(audio);

        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
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
      buffer,
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

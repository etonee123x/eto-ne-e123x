import { useResetableRef } from '@/composables/useResetableRef';
import type { components } from '@/types/openapi';
import { nonNullable } from '@/utils/nonNullable';
import { objectGet } from '@etonee123x/shared/utils/objectGet';
import { computed, inject, reactive, shallowRef } from 'vue';
import type { FunctionPlugin, InjectionKey, Reactive, ShallowRef } from 'vue';

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
  audio: ShallowRef<HTMLAudioElement | null>;
}

const INJECTION_KEY: InjectionKey<Context> = Symbol('player');

export const createPlayer = () => {
  const audio: Context['audio'] = shallowRef(null);

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

  const install: FunctionPlugin = (app) => {
    app.provide(INJECTION_KEY, {
      theTrack,
      playlist,
      unload,
      hooksOnUnload,
      audio,
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

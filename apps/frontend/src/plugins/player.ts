import { isFolderDataItemFileAudio } from '@/helpers/folderData';
import type { components } from '@/types/openapi';
import { nonNullable } from '@/utils/nonNullable';
import { objectGet } from '@etonee123x/shared/utils/objectGet';
import { computed, inject, shallowRef } from 'vue';
import type { FunctionPlugin, InjectionKey, ShallowRef } from 'vue';

interface Context {
  theTrack: ShallowRef<components['schemas']['FolderDataItemAudio'] | null>;
  playlist: ShallowRef<Array<components['schemas']['FolderDataItemAudio']>>;
}

const INJECTION_KEY: InjectionKey<Context> = Symbol('player');

export const createPlayer = () => {
  const theTrack: Context['theTrack'] = shallowRef(null);
  const playlist: Context['playlist'] = shallowRef([]);

  const install: FunctionPlugin = (app) => {
    app.provide(INJECTION_KEY, {
      theTrack,
      playlist,
    });
  };

  const init = () => {
    const _theTrack = objectGet(globalThis.__PLAYER__, 'theTrack');
    const _playlist = objectGet(globalThis.__PLAYER__, 'playlist');

    if (
      (_theTrack === null || isFolderDataItemFileAudio(_theTrack)) &&
      Array.isArray(_playlist) &&
      _playlist.every((item) => {
        return isFolderDataItemFileAudio(item);
      })
    ) {
      theTrack.value = _theTrack;
      playlist.value = _playlist;
    }
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

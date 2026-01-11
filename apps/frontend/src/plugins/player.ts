import { isFolderDataItemFileAudio } from '@/helpers/folderData';
import type { components } from '@/types/openapi';
import { objectGet } from '@etonee123x/shared/utils/objectGet';
import { computed, inject, shallowRef } from 'vue';
import type { FunctionPlugin, InjectionKey, ShallowRef } from 'vue';

type TheTrack = components['schemas']['FolderDataItemAudio'] | null;
type Playlist = Array<components['schemas']['FolderDataItemAudio']>;

export const INJECTION_KEY_PLAYER: InjectionKey<{
  theTrack: ShallowRef<TheTrack>;
  playlist: ShallowRef<Playlist>;
}> = Symbol('player');

export const createPlayer = () => {
  const theTrack = shallowRef<TheTrack>(null);
  const playlist = shallowRef<Playlist>([]);

  const install: FunctionPlugin = (app) => {
    app.provide(INJECTION_KEY_PLAYER, {
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
  const player = inject(INJECTION_KEY_PLAYER);

  if (!player) {
    throw new Error('Player plugin is not installed');
  }

  return player;
};

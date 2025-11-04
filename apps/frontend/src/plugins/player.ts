import type { ItemAudio } from '@etonee123x/shared/helpers/folderData';
import { computed, inject, shallowRef } from 'vue';
import type { FunctionPlugin, InjectionKey, ShallowRef } from 'vue';

type TheTrack = ItemAudio | null;
type Playlist = Array<ItemAudio>;

export const INJECTION_KEY_PLAYER: InjectionKey<{
  theTrack: ShallowRef<TheTrack>;
  playlist: ShallowRef<Playlist>;
}> = Symbol('player');

interface Options {
  theTrack?: TheTrack;
  playlist?: Array<ItemAudio>;
}

export const createPlayer = () => {
  const theTrack = shallowRef<TheTrack>(null);
  const playlist = shallowRef<Playlist>([]);

  const install: FunctionPlugin = (app, options: Options = {}) => {
    theTrack.value = options.theTrack ?? theTrack.value;
    playlist.value = options.playlist ?? playlist.value;

    app.provide(INJECTION_KEY_PLAYER, {
      theTrack,
      playlist,
    });
  };

  return {
    install,

    state: computed(() => ({
      theTrack: theTrack.value,
      playlist: playlist.value,
    })),
  };
};

export const usePlayer = () => {
  const player = inject(INJECTION_KEY_PLAYER);

  if (!player) {
    throw new Error('Player plugin is not installed');
  }

  return player;
};

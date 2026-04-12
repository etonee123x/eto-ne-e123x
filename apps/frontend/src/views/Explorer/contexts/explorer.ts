import { awaitSuspensesIfNecessary } from '@/helpers/awaitSuspensesIfNecessary';
import { usePlayer } from '@/plugins/player';
import { nonNullable } from '@/utils/nonNullable';
import { FILE_TYPES, isFolderDataItemFileAudio } from '@/helpers/folderData';
import { useQueryClient } from '@tanstack/vue-query';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { inject, provide, reactive, watch, watchEffect } from 'vue';
import type { InjectionKey, Reactive } from 'vue';
import type { components } from '@/types/openapi';
import { useSegments } from '../composables/useSegments';
import { useQueryGetFolderData } from '../composables/useQueryGetFolderData';

interface ExplorerContext {
  getFolderDataQuery: Reactive<UseQueryReturnType<components['schemas']['FolderDataResponse'], unknown>>;
}

const INJECTION_KEY_EXPLORER: InjectionKey<ExplorerContext> = Symbol('explorer');

export const provideExplorerContext = async () => {
  const player = reactive(usePlayer());
  const queryClient = useQueryClient();

  const segments = useSegments();

  const getFolderDataQuery: ExplorerContext['getFolderDataQuery'] = reactive(useQueryGetFolderData({ segments }));

  const explorerContext = {
    getFolderDataQuery,
  };

  provide(INJECTION_KEY_EXPLORER, explorerContext);

  await awaitSuspensesIfNecessary([[getFolderDataQuery.isEnabled, getFolderDataQuery.suspense]]);

  watch(
    () => {
      return getFolderDataQuery.data;
    },
    () => {
      if (!getFolderDataQuery.data) {
        return;
      }

      if (!getFolderDataQuery.data.file) {
        return;
      }

      getFolderDataQuery.data.files.forEach((file) => {
        queryClient.setQueryData(['folderData', [...segments.value.slice(0, -1), file.name].join('/')], () => {
          return {
            ...getFolderDataQuery.data,
            path: [getFolderDataQuery.data.pathDirectory, file.name].join('/'),
            file,
          };
        });
      });
    },
    {
      immediate: true,
    },
  );

  watchEffect(() => {
    const folderData = getFolderDataQuery.data;

    const maybeFile = folderData?.file;

    if (!maybeFile) {
      // это зачем?
      // gallery.items.value = [];

      return;
    }

    if (maybeFile.fileType === FILE_TYPES.AUDIO) {
      player.theTrack.value = maybeFile;

      player.playlist.value = {
        tracks: folderData.files.filter((file) => {
          return isFolderDataItemFileAudio(file);
        }),
        pathDirectory: folderData.pathDirectory,
      };
    }
  });

  return explorerContext;
};

export const useExplorerContext = () => {
  return nonNullable(inject(INJECTION_KEY_EXPLORER));
};

import { useGoToPage404 } from '@/composables/useGoToPage404';
import { awaitSuspensesIfNecessary } from '@/helpers/awaitSuspensesIfNecessary';
import { useGallery } from '@/plugins/gallery';
import { usePlayer } from '@/plugins/player';
import { ROUTE_NAMES } from '@/plugins/router';
import { nonNullable } from '@/utils/nonNullable';
import { FILE_TYPES } from '@/helpers/folderData';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { computed, inject, provide, reactive, watch, watchEffect } from 'vue';
import type { ComputedRef, InjectionKey, Reactive, UnwrapRef } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@/api/client';
import { useClientRequestPromiseWrapper } from '@/composables/useClientRequestPromiseWrapper';
import type { components } from '@/types/openapi';
import { useL10n } from '@/composables/useL10n';

interface ExplorerContext {
  getFolderDataQuery: Reactive<UseQueryReturnType<components['schemas']['FolderDataResponse'], unknown>>;
  navigationLinks: ComputedRef<Array<{ text: string; to: string }>>;
}

const INJECTION_KEY_EXPLORER: InjectionKey<ExplorerContext> = Symbol('explorer');
const MODULE_NAME = 'explorer';

export const provideExplorerContext = async () => {
  const clientRequestPromiseWrapper = useClientRequestPromiseWrapper();

  const route = useRoute();
  const player = usePlayer();
  const gallery = useGallery();
  const goToPage404 = useGoToPage404();
  const l10n = useL10n();
  const queryClient = useQueryClient();

  const segments = computed(() => {
    return typeof route.params.segments === 'string' && route.params.segments !== ''
      ? [route.params.segments]
      : route.params.segments || [];
  });

  const navigationLinks: ExplorerContext['navigationLinks'] = computed(() => {
    const segments = getFolderDataQuery.data?.path.split('/').filter(Boolean) ?? [];

    return (segments.at(-1) === getFolderDataQuery.data?.file?.name ? segments.slice(0, -1) : segments).reduce(
      (segments, segment) => {
        return [
          ...segments,
          {
            text: segment,
            to: [nonNullable(segments.at(-1)).to, segment].join('/'),
          },
        ];
      },
      [
        {
          text: 'root',
          to: l10n.localizePath(MODULE_NAME),
        },
      ],
    );
  });

  const getFolderDataQuery: ExplorerContext['getFolderDataQuery'] = reactive(
    useQuery({
      queryKey: [
        'folderData',
        computed(() => {
          return segments.value.join('/');
        }),
      ] as const,
      queryFn: (...parameters): Promise<UnwrapRef<ExplorerContext['getFolderDataQuery']['data']>> => {
        return clientRequestPromiseWrapper(
          client['/folder-data'].GET({ params: { query: { path: parameters[0].queryKey[1] } } }),
        ).catch(() => {
          return goToPage404();
        });
      },
      enabled: () => {
        return route.name === ROUTE_NAMES.EXPLORER;
      },
    }),
  );

  const explorerContext = {
    getFolderDataQuery,
    navigationLinks,
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
      gallery.items.value = [];

      return;
    }

    if (maybeFile.fileType === FILE_TYPES.AUDIO) {
      player.playlist.value = folderData.files.filter((file) => {
        return file.fileType === FILE_TYPES.AUDIO;
      });
      player.theTrack.value = maybeFile;

      return;
    }

    if (maybeFile.fileType === FILE_TYPES.IMAGE || maybeFile.fileType === FILE_TYPES.VIDEO) {
      gallery.loadGalleryItem(
        maybeFile,
        folderData.files.filter((file) => {
          return file.fileType === FILE_TYPES.IMAGE || file.fileType === FILE_TYPES.VIDEO;
        }),
      );
    }
  });

  return explorerContext;
};

export const useExplorerContext = () => {
  return nonNullable(inject(INJECTION_KEY_EXPLORER));
};

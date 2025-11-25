import { getFolderData as _getFolderData } from '@/api/folderData';
import type { FolderDataWithSinceTimestamps } from '@/api/folderData';
import { useGoToPage404 } from '@/composables/useGoToPage404';
import { useL10n } from '@/composables/useL10n';
import { awaitSuspensesIfNecessary } from '@/helpers/awaitSuspensesIfNecessary';
import { useGallery } from '@/plugins/gallery';
import { usePlayer } from '@/plugins/player';
import { ROUTE_NAMES } from '@/router';
import { nonNullable } from '@/utils/nonNullable';
import { FILE_TYPES, ITEM_TYPES } from '@etonee123x/shared/helpers/folderData';
import { useQuery } from '@tanstack/vue-query';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { computed, inject, provide, watchEffect } from 'vue';
import type { InjectionKey } from 'vue';
import { useRoute } from 'vue-router';

interface ExplorerContext {
  getFolderDataQuery: UseQueryReturnType<FolderDataWithSinceTimestamps, unknown>;
}

const INJECTION_KEY_EXPLORER: InjectionKey<ExplorerContext> = Symbol('explorer');

export const provideExplorerContext = async () => {
  const { localizePath } = useL10n();

  const route = useRoute();
  const player = usePlayer();
  const gallery = useGallery();

  const moduleURLResolver = (url: string) => localizePath(`/explorer${url}`);

  const routeMatterPath = computed(() =>
    Array.isArray(route.params.links) //
      ? '/' + route.params.links.join('/')
      : '/',
  );

  const goToPage404 = useGoToPage404();

  const getFolderDataQuery: ExplorerContext['getFolderDataQuery'] = useQuery({
    queryKey: ['folderData', routeMatterPath],
    queryFn: () =>
      _getFolderData(routeMatterPath.value)
        .then((_folderData) => ({
          items: _folderData.items.map((item) => ({
            ...item,
            url: moduleURLResolver(item.url),
          })),
          lvlUp: _folderData.lvlUp && moduleURLResolver(_folderData.lvlUp),
          navigationItems: _folderData.navigationItems.map((navigationItem) => ({
            ...navigationItem,
            link: moduleURLResolver(navigationItem.link),
          })),
          linkedFile: _folderData.linkedFile && {
            ..._folderData.linkedFile,
            url: moduleURLResolver(_folderData.linkedFile.url),
          },
        }))
        .catch(() => goToPage404()),
    enabled: () => route.name === ROUTE_NAMES.EXPLORER,
  });

  const explorerContext = {
    getFolderDataQuery,
  };

  provide(INJECTION_KEY_EXPLORER, explorerContext);

  await awaitSuspensesIfNecessary([[getFolderDataQuery.isEnabled.value, getFolderDataQuery.suspense]]);

  watchEffect(() => {
    const folderData = getFolderDataQuery.data.value;

    const folderDataLinkedFile = folderData?.linkedFile;

    if (!folderDataLinkedFile) {
      gallery.items.value = [];

      return;
    }

    if (folderDataLinkedFile.fileType === FILE_TYPES.AUDIO) {
      player.playlist.value = folderData.items.filter(
        (item) => item.itemType === ITEM_TYPES.FILE && item.fileType === FILE_TYPES.AUDIO,
      );

      player.theTrack.value = folderDataLinkedFile;
    } else if (
      folderDataLinkedFile.fileType === FILE_TYPES.IMAGE ||
      folderDataLinkedFile.fileType === FILE_TYPES.VIDEO
    ) {
      gallery.loadGalleryItem(
        folderDataLinkedFile,
        folderData.items.filter(
          (item) =>
            item.itemType === ITEM_TYPES.FILE &&
            (item.fileType === FILE_TYPES.IMAGE || item.fileType === FILE_TYPES.VIDEO),
        ),
      );
    }
  });

  return explorerContext;
};

export const useExplorerContext = () => nonNullable(inject(INJECTION_KEY_EXPLORER));

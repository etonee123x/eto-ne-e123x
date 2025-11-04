import { type FolderDataWithSinceTimestamps, getFolderData as _getFolderData } from '@/api/folderData';
import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { useL10n } from '@/composables/useL10n';
import { useSSRContext } from '@/composables/useSsrContext';
import { isServer } from '@/constants/target';
import { useGallery } from '@/plugins/gallery';
import { usePlayer } from '@/plugins/player';
import { nonNullable } from '@/utils/nonNullable';
import { FILE_TYPES, ITEM_TYPES } from '@etonee123x/shared/helpers/folderData';
import { pick } from '@etonee123x/shared/utils/pick';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { inject, provide, shallowRef, type InjectionKey } from 'vue';
import { useRoute, type RouteLocationNormalizedLoaded, type RouteLocationNormalizedLoadedGeneric } from 'vue-router';

interface ExplorerContext {
  getFolderData: ReturnType<
    typeof useAsyncStateApi<FolderDataWithSinceTimestamps, undefined, [RouteLocationNormalizedLoadedGeneric]>
  >;
  currentFolderData: () => FolderDataWithSinceTimestamps | undefined;
}

const routeToMatterPath = (route: RouteLocationNormalizedLoaded) =>
  Array.isArray(route.params.links) ? '/' + route.params.links.join('/') : '/';

export const INJECTION_KEY_EXPLORER: InjectionKey<ExplorerContext> = Symbol('explorer');

type RoutePathToFolderData = Record<string, FolderDataWithSinceTimestamps>;

export const provideExplorerContext = () => {
  const { localizePath } = useL10n();
  const route = useRoute();
  const player = usePlayer();
  const gallery = useGallery();

  const routePathToFolderData = shallowRef<RoutePathToFolderData>(
    isServer ? {} : (globalThis.__PAYLOAD__.routePathToFolderData ?? {}),
  );

  const moduleURLResolver = (url: string) => localizePath(`/explorer${url}`);

  const maybeSsrContext = isServer ? useSSRContext() : undefined;

  const getFolderData = useAsyncStateApi(async (to: RouteLocationNormalizedLoaded) => {
    const matterPath = routeToMatterPath(to);

    const maybeFolderData = routePathToFolderData.value[matterPath];

    const folderData =
      maybeFolderData ??
      (await _getFolderData(matterPath)
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
        .catch(throwError));

    routePathToFolderData.value[matterPath] = folderData;

    if (maybeSsrContext) {
      maybeSsrContext.payload.routePathToFolderData = routePathToFolderData.value;
    }

    const folderDataLinkedFile = folderData.linkedFile;

    if (!folderDataLinkedFile) {
      gallery.items.value = [];

      return folderData;
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
        pick(folderDataLinkedFile, ['name', 'src', 'fileType']),
        folderData.items.reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>(
          (accumulator, folderElement) =>
            folderElement.itemType === ITEM_TYPES.FILE &&
            (folderElement.fileType === FILE_TYPES.IMAGE || folderElement.fileType === FILE_TYPES.VIDEO)
              ? [...accumulator, pick(folderElement, ['name', 'src', 'fileType'])]
              : accumulator,
          [],
        ),
      );
    }

    return folderData;
  });

  const currentFolderData = () => routePathToFolderData.value[routeToMatterPath(route)];

  const explorerContext = {
    getFolderData,
    currentFolderData,
  };

  provide(INJECTION_KEY_EXPLORER, explorerContext);

  return explorerContext;
};

export const useExplorerContext = () => nonNullable(inject(INJECTION_KEY_EXPLORER));

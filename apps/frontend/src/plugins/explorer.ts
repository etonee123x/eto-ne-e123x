import { getFolderData as _getFolderData, type FolderDataWithSinceTimestamps } from '@/api/folderData';
import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { useL10n } from '@/composables/useL10n';
import { FILE_TYPES, ITEM_TYPES } from '@etonee123x/shared/helpers/folderData';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { computed, inject, shallowRef, type FunctionPlugin, type InjectionKey } from 'vue';
import { useRoute, type RouteLocationNormalizedLoaded, type RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import { useGallery } from './gallery';
import { usePlayer } from './player';
import { pick } from '@etonee123x/shared/utils/pick';

interface Context {
  getFolderData: ReturnType<
    typeof useAsyncStateApi<FolderDataWithSinceTimestamps, undefined, [RouteLocationNormalizedLoadedGeneric]>
  >;
  currentFolderData: () => FolderDataWithSinceTimestamps | undefined;
}

type RoutePathToFolderData = Record<string, FolderDataWithSinceTimestamps>;

export const INJECTION_KEY_EXPLORER: InjectionKey<Context> = Symbol('explorer');

export const createExplorer = () => {
  const routePathToFolderData = shallowRef<RoutePathToFolderData>({});

  const install: FunctionPlugin = (app, options: Partial<{ routePathToFolderData: RoutePathToFolderData }> = {}) => {
    routePathToFolderData.value = options.routePathToFolderData ?? routePathToFolderData.value;

    const getFolderData = useAsyncStateApi(async (to: RouteLocationNormalizedLoaded) => {
      const player = usePlayer();
      const gallery = useGallery();

      const { localizePath } = useL10n();

      const moduleURLResolver = (url: string) => localizePath(`/explorer${url}`);

      const matterPath = '/' + Array.from(to.params.links ?? []).join('/');

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
          folderData?.items.reduce<NonNullable<Parameters<typeof gallery.loadGalleryItem>[1]>>(
            (acc, folderElement) =>
              folderElement.itemType === ITEM_TYPES.FILE &&
              (folderElement.fileType === FILE_TYPES.IMAGE || folderElement.fileType === FILE_TYPES.VIDEO)
                ? [...acc, pick(folderElement, ['name', 'src', 'fileType'])]
                : acc,
            [],
          ),
        );
      }

      return folderData;
    });

    const currentFolderData = () => {
      const route = useRoute();

      return routePathToFolderData.value['/' + Array.from(route.params.links ?? []).join('/')];
    };

    app.provide(INJECTION_KEY_EXPLORER, {
      getFolderData,
      currentFolderData,
    });
  };

  return {
    install,

    state: computed(() => ({
      routePathToFolderData: routePathToFolderData.value,
    })),
  };
};

export const useExplorer = () => {
  const explorer = inject(INJECTION_KEY_EXPLORER);

  if (!explorer) {
    throw new Error('Explorer plugin is not installed');
  }

  return explorer;
};

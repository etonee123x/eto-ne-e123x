import { getFolderData as _getFolderData } from '@/api/folderData';
import type { FolderDataWithSinceTimestamps } from '@/api/folderData';
import { useGoToPage404 } from '@/composables/useGoToPage404';
import { useL10n } from '@/composables/useL10n';
import { ROUTE_NAMES } from '@/router';
import { nonNullable } from '@/utils/nonNullable';
import { useQuery } from '@tanstack/vue-query';
import type { UseQueryReturnType } from '@tanstack/vue-query';
import { computed, inject, provide } from 'vue';
import type { InjectionKey } from 'vue';
import { useRoute } from 'vue-router';

interface ExplorerContext {
  getFolderDataQuery: UseQueryReturnType<FolderDataWithSinceTimestamps, unknown>;
}

const INJECTION_KEY_EXPLORER: InjectionKey<ExplorerContext> = Symbol('explorer');

export const provideExplorerContext = () => {
  const { localizePath } = useL10n();

  const route = useRoute();

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

  return explorerContext;
};

export const useExplorerContext = () => nonNullable(inject(INJECTION_KEY_EXPLORER));

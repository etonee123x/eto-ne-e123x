import { client } from '@/api/client';
import { useClientRequestPromiseWrapper } from '@/composables/useClientRequestPromiseWrapper';
import { useGoToPage404 } from '@/composables/useGoToPage404';
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

export const useQueryGetFolderData = (
  parameters: {
    segments: MaybeRefOrGetter<Array<string>>;
  },
  parametersQuery?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) => {
  const clientRequestPromiseWrapper = useClientRequestPromiseWrapper();
  const goToPage404 = useGoToPage404();

  return useQuery({
    queryKey: [
      'folderData',
      computed(() => {
        return toValue(parameters.segments).join('/');
      }),
    ] as const,
    queryFn: (...parameters) => {
      return clientRequestPromiseWrapper(
        client['/folder-data'].GET({ params: { query: { path: parameters[0].queryKey[1] } } }),
      ).catch(() => {
        return goToPage404();
      });
    },
    ...parametersQuery,
  });
};

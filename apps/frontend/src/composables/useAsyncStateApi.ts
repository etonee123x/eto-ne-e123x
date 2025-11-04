import { type FetchError } from 'ofetch';
import { computed, ref } from 'vue';
import { isServer } from '@/constants/target';
import { nonNullable } from '@/utils/nonNullable';
import { useSourcedRef } from '@/composables/useSourcedRef';
import { useSSRContext } from '@/composables/useSsrContext';
import { useLoadingSources } from '@/plugins/loadingSources';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type RequestFunction<Data, Parameters_ extends Array<any> = []> = (...parameters: Parameters_) => Promise<Data>;

type Options<Data> = Partial<{
  onSuccess: (data: Data) => void;
}>;

type UseAsyncStateApiParametersWithKey<
  Data,
  InitialState extends Data | undefined,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  Parameters_ extends Array<any> = [],
> = [
  //
  key: string,
  requestFunction: RequestFunction<Data, Parameters_>,
  initialState?: InitialState,
  options?: Options<Data>,
];

type UseAsyncStateApiParametersWithoutKey<
  Data,
  InitialState extends Data | undefined,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  Parameters_ extends Array<any> = [],
> = [
  //
  requestFunction: RequestFunction<Data, Parameters_>,
  initialState?: InitialState,
  options?: Options<Data>,
];

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type UseAsyncStateApiParameters<Data, InitialState extends Data | undefined, Parameters_ extends Array<any> = []> =
  | UseAsyncStateApiParametersWithKey<Data, InitialState, Parameters_>
  | UseAsyncStateApiParametersWithoutKey<Data, InitialState, Parameters_>;

export const useAsyncStateApi = <
  Data,
  InitialState extends Data | undefined = undefined,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  Parameters_ extends Array<any> = [],
>(
  ...parameters: UseAsyncStateApiParameters<Data, InitialState, Parameters_>
) => {
  const [
    //
    key,
    requestFunction,
    initialState,
    options = {},
  ] = parameters as UseAsyncStateApiParametersWithKey<Data, InitialState, Parameters_>;

  const state = ref(initialState as InitialState extends undefined ? Data | undefined : Data);

  const [promise, resetPromise] = useSourcedRef<Promise<Data> | null>(null);
  const loadingSources = useLoadingSources();

  const isLoading = computed(() => Boolean(promise.value));

  const _execute = async (...parameters: Parameters_): Promise<Data> => {
    if (isServer) {
      const ssrContext = nonNullable(useSSRContext());

      if (!ssrContext.payload[key]) {
        promise.value = requestFunction(...parameters)
          .then((data) => {
            ssrContext.payload[key] = data;
            state.value = data;

            options.onSuccess?.(data);

            return state.value;
          })
          .finally(resetPromise);

        return promise.value;
      }

      state.value = ssrContext.payload[key] as InitialState;

      return state.value;
    }

    const initial = globalThis.__PAYLOAD__?.[key] as InitialState;

    if (initial) {
      state.value = initial;
      // Низкоуровневый API, ничего не поделаешь.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete globalThis.__PAYLOAD__[key];

      return state.value;
    }

    promise.value = requestFunction(...parameters)
      .then((data) => {
        state.value = data;

        return state.value;
      })
      .finally(resetPromise);

    return promise.value;
  };

  const _onError = (error: FetchError<Data>) => {
    throw error;
  };

  const execute = async (...parameters: Parameters_) => {
    const promise = _execute(...parameters)
      .catch(_onError)
      .finally(() => loadingSources.delete(promise));

    loadingSources.add(promise);

    return promise;
  };

  const executeSilently = (...parameters: Parameters_) => _execute(...parameters).catch(_onError);

  return {
    state,
    isLoading,
    promise,
    execute,
    executeSilently,
  };
};

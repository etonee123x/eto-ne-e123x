import { clone } from '@/utils/clone';
import { makeDestructurable } from '@vueuse/core';
import { computed, ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export const useResetableRef = <Source>(source: MaybeRefOrGetter<Source>) => {
  const sourceComputed = computed(() => {
    return toValue(source);
  });

  const getClonedSourceValue = () => {
    return clone(sourceComputed.value);
  };

  const value = ref(getClonedSourceValue());

  const reset = () => {
    value.value = getClonedSourceValue();
  };

  return makeDestructurable({ value, reset } as const, [value, reset] as const);
};

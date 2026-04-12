import { computed } from 'vue';
import { useRoute } from 'vue-router';

export const useSegments = () => {
  const route = useRoute();

  return computed(() => {
    return typeof route.params.segments === 'string' && route.params.segments !== ''
      ? [route.params.segments]
      : route.params.segments || [];
  });
};

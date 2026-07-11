import { nonNullable } from '@/utils/nonNullable';
import { useSSRContext } from '@/composables/useSsrContext';
import { useCookies } from '@vueuse/integrations/useCookies';
import { isServer } from '@/constants/target';

export const useGetCookie = (key: string) => {
  const cookies = useCookies([key]);

  return () => {
    return isServer //
      ? nonNullable(useSSRContext()).express.request.cookies[key]
      : cookies.get(key);
  };
};

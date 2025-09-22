import { isServer } from '@/constants/target';
import { ROUTE_NAMES } from '@/router';
import { useRouter } from 'vue-router';
import { createError } from '@etonee123x/shared/helpers/error';

export const useGoToPage404 = () => {
  const router = useRouter();

  return () => {
    if (isServer) {
      throw createError({ statusCode: 404 });
    }

    return router.push({ name: ROUTE_NAMES.PAGE_404 });
  };
};

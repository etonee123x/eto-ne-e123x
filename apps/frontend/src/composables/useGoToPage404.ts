import { isServer } from '@/constants/target';
import { Error404 } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router';
import { useRouter } from 'vue-router';

export const useGoToPage404 = () => {
  const router = useRouter();

  return () => {
    if (isServer) {
      throw new Error404();
    }

    return router.push({ name: ROUTE_NAMES.PAGE_404 });
  };
};

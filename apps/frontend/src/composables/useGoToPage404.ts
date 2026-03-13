import { isServer } from '@/constants/target';
import { Error404 } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { useRouter } from 'vue-router';

export const useGoToPage404 = () => {
  const router = useRouter();

  return () => {
    if (isServer) {
      throw new Error404();
    }

    router.push({ name: ROUTE_NAMES.PAGE_404 });

    return throwError();
  };
};

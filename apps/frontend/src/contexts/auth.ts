import { postAuth as _postAuth, deleteAuth as _deleteAuth } from '@/api/auth';
import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { useGetCookie } from '@/composables/useGetCookie';
import { KEY_JWT } from '@/constants/keys';
import { isDevelopment } from '@/constants/mode';
import { nonNullable } from '@/utils/nonNullable';
import { isRealObject } from '@etonee123x/shared/utils/isRealObject';
import { isString } from '@etonee123x/shared/utils/isString';
import { jsonParse } from '@etonee123x/shared/utils/jsonParse';
import { computed, inject, provide } from 'vue';
import type { ComputedRef, InjectionKey } from 'vue';

interface AuthContext {
  postAuth: ReturnType<typeof useAsyncStateApi<Awaited<ReturnType<typeof _postAuth>>>>;
  deleteAuth: ReturnType<typeof useAsyncStateApi<Awaited<ReturnType<typeof _deleteAuth>>>>;
  isAdmin: ComputedRef<boolean>;
}

export const INJECTION_KEY_AUTH: InjectionKey<AuthContext> = Symbol('auth');

export const provideAuthContext = () => {
  const getJwtCookie = useGetCookie(KEY_JWT);

  const postAuth = useAsyncStateApi(_postAuth);
  const deleteAuth = useAsyncStateApi(_deleteAuth);

  const isAdmin = computed(() => {
    const cookieJwt = getJwtCookie();

    if (!isString(cookieJwt)) {
      return false;
    }

    if (cookieJwt === 'dev-jwt') {
      return isDevelopment;
    }

    const parseBase64Payload =
      'atob' in globalThis ? globalThis.atob : (input: string) => Buffer.from(input, 'base64').toString('utf8');

    const jwtParsed = jsonParse(parseBase64Payload(nonNullable(cookieJwt.split('.')[1])));

    return isRealObject(jwtParsed) && 'isAdmin' in jwtParsed && jwtParsed.isAdmin === true;
  });

  provide(INJECTION_KEY_AUTH, {
    postAuth,
    deleteAuth,

    isAdmin,
  });
};

export const useAuthContext = () => nonNullable(inject(INJECTION_KEY_AUTH));

import { postAuth as _postAuth, deleteAuth as _deleteAuth } from '@/api/auth';
import { useGetCookie } from '@/composables/useGetCookie';
import { KEY_JWT } from '@/constants/keys';
import { isDevelopment } from '@/constants/mode';
import { nonNullable } from '@/utils/nonNullable';
import { isRealObject } from '@etonee123x/shared/utils/isRealObject';
import { isString } from '@etonee123x/shared/utils/isString';
import { jsonParse } from '@etonee123x/shared/utils/jsonParse';
import { useMutation } from '@tanstack/vue-query';
import type { UseMutationReturnType } from '@tanstack/vue-query';
import { computed, inject, provide } from 'vue';
import type { ComputedRef, InjectionKey } from 'vue';

interface AuthContext {
  postAuthMutation: UseMutationReturnType<
    Awaited<ReturnType<typeof _postAuth>>,
    Error,
    Parameters<typeof _postAuth>[0],
    unknown
  >;
  deleteAuthMutation: UseMutationReturnType<Awaited<ReturnType<typeof _deleteAuth>>, Error, void, unknown>;
  isAdmin: ComputedRef<boolean>;
}

export const INJECTION_KEY_AUTH: InjectionKey<AuthContext> = Symbol('auth');

export const provideAuthContext = () => {
  const getJwtCookie = useGetCookie(KEY_JWT);

  const postAuthMutation = useMutation({
    mutationKey: ['auth'],
    mutationFn: _postAuth,
  });

  const deleteAuthMutation = useMutation({
    mutationKey: ['auth'],
    mutationFn: _deleteAuth,
  });

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
    postAuthMutation,
    deleteAuthMutation,

    isAdmin,
  });
};

export const useAuthContext = () => nonNullable(inject(INJECTION_KEY_AUTH));

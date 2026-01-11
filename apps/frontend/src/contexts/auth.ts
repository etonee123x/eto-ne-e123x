import { client } from '@/api/client';
import { useClientRequestPromiseWrapper } from '@/composables/useClientRequestPromiseWrapper';
import { useGetCookie } from '@/composables/useGetCookie';
import { KEY_JWT } from '@/constants/keys';
import { isDevelopment } from '@/constants/mode';
import { nonNullable } from '@/utils/nonNullable';
import { jsonParse } from '@etonee123x/shared/utils/jsonParse';
import { useMutation } from '@tanstack/vue-query';
import type { UseMutationReturnType } from '@tanstack/vue-query';
import { computed, inject, provide } from 'vue';
import type { ComputedRef, InjectionKey, UnwrapRef } from 'vue';

interface AuthContext {
  postAuthMutation: UseMutationReturnType<
    NonNullable<Awaited<ReturnType<(typeof client)['/auth']['POST']>>['data']>,
    Error,
    Parameters<(typeof client)['/auth']['POST']>[0],
    unknown
  >;
  deleteAuthMutation: UseMutationReturnType<
    NonNullable<Awaited<ReturnType<(typeof client)['/auth']['DELETE']>>['data']>,
    Error,
    Parameters<(typeof client)['/auth']['DELETE']>[0],
    unknown
  >;
  isAdmin: ComputedRef<boolean>;
}

export const INJECTION_KEY_AUTH: InjectionKey<AuthContext> = Symbol('auth');

export const provideAuthContext = () => {
  const getJwtCookie = useGetCookie(KEY_JWT);
  const clientRequestPromiseWrapper = useClientRequestPromiseWrapper();

  const postAuthMutation: AuthContext['postAuthMutation'] = useMutation({
    mutationKey: ['auth'],
    mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<AuthContext['postAuthMutation']['data']>>> => {
      return clientRequestPromiseWrapper(client['/auth'].POST(parameters[0]));
    },
  });

  const deleteAuthMutation: AuthContext['deleteAuthMutation'] = useMutation({
    mutationKey: ['auth'],
    mutationFn: (...parameters): Promise<NonNullable<UnwrapRef<AuthContext['deleteAuthMutation']['data']>>> => {
      return clientRequestPromiseWrapper(client['/auth'].DELETE(parameters[0]));
    },
  });

  const isAdmin = computed(() => {
    const cookieJwt = getJwtCookie();

    if (typeof cookieJwt !== 'string') {
      return false;
    }

    if (cookieJwt === 'dev-jwt') {
      return isDevelopment;
    }

    const parseBase64Payload =
      'atob' in globalThis
        ? globalThis.atob
        : (input: string) => {
            return Buffer.from(input, 'base64').toString('utf8');
          };

    const jwtParsed = jsonParse(parseBase64Payload(nonNullable(cookieJwt.split('.')[1])));

    return typeof jwtParsed === 'object' && jwtParsed !== null && 'isAdmin' in jwtParsed && jwtParsed.isAdmin === true;
  });

  provide(INJECTION_KEY_AUTH, {
    postAuthMutation,
    deleteAuthMutation,

    isAdmin,
  });
};

export const useAuthContext = () => {
  return nonNullable(inject(INJECTION_KEY_AUTH));
};

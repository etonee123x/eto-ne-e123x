import { defineStore } from 'pinia';
import { computed } from 'vue';

import { postAuth as _postAuth, deleteAuth as _deleteAuth } from '@/api/auth';
import { useAsyncStateApi } from '@/composables/useAsyncStateApi';
import { isString } from '@etonee123x/shared/utils/isString';
import { jsonParse } from '@etonee123x/shared/utils/jsonParse';
import { isRealObject } from '@etonee123x/shared/utils/isRealObject';
import { KEY_JWT } from '@/constants/keys';
import { isDevelopment } from '@/constants/mode';
import { nonNullable } from '@/utils/nonNullable';
import { useGetCookie } from '@/composables/useGetCookie';

export const useAuthStore = defineStore('auth', () => {
  const getJwtCookie = useGetCookie(KEY_JWT);

  const { execute: postAuth, isLoading: isLoadingPostAuth } = useAsyncStateApi(_postAuth);
  const { execute: deleteAuth, isLoading: isLoadingDeleteAuth } = useAsyncStateApi(_deleteAuth);

  const isAdmin = computed(() => {
    const cookieJwt = getJwtCookie();

    if (!isString(cookieJwt)) {
      return false;
    }

    if (cookieJwt === 'dev-jwt') {
      return isDevelopment;
    }

    const parseBase64Payload =
      'atob' in globalThis ? globalThis.atob : (input: string) => Buffer.from(input, 'base64').toString('utf-8');

    const jwtParsed = jsonParse(parseBase64Payload(nonNullable(cookieJwt.split('.')[1])));

    return isRealObject(jwtParsed) && 'isAdmin' in jwtParsed && jwtParsed.isAdmin === true;
  });

  return {
    postAuth,
    isLoadingPostAuth,

    deleteAuth,
    isLoadingDeleteAuth,

    isAdmin,
  };
});

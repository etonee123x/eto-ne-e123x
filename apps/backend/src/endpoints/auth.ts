import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';
import type { OperationHandler, OperationResponse } from '@/types/openapi';
import Express from 'express';

export const createAuth: OperationHandler<'createAuth', [Express.Request, Express.Response]> = async (
  ...[, request, response]
) => {
  const data: OperationResponse<'createAuth'> = {
    jwt: request.cookies[KEY_COOKIE_JWT],
  };
  return response.send(data);
};

export const deleteAuth: OperationHandler<'deleteAuth', [Express.Request, Express.Response]> = async (
  ...[, , response]
) => {
  const data: OperationResponse<'deleteAuth'> = {
    jwt: null,
  };
  return response.clearCookie(KEY_COOKIE_JWT).send(data);
};

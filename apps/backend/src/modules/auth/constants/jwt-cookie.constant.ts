import type Express from 'express';
import { appConfig } from '@/config/app-config';
import type { Algorithm } from 'jsonwebtoken';

export const JWT_ALGORITHMS: Array<Algorithm> = ['HS256', 'HS384', 'HS512'];

export const JWT_COOKIE_OPTIONS: Express.CookieOptions = {
  httpOnly: true,
  secure: appConfig.isProduction,
  sameSite: 'lax',
  path: '/',
};

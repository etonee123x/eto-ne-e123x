import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { appConfig } from '@/config/app-config';
const url = new URL('/en/blog', 'http://localhost:3000');

url.searchParams.set(
  KEY_COOKIE_JWT,
  jsonwebtoken.sign({ isAdmin: true }, appConfig.secretKey, {
    expiresIn: appConfig.authTokenMaxLifetimeMinutes * 60,
  }),
);

// eslint-disable-next-line no-console
console.log(url.href);

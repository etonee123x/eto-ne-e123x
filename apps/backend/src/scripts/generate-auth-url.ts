import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';
import { KEY_COOKIE_JWT } from '@/constants/key-cookie-jwt';
import { throwError } from '@/utils/throw.error';

const url = new URL('/en/blog', 'http://localhost:3000');

url.searchParams.set(
  KEY_COOKIE_JWT,
  jsonwebtoken.sign({ isAdmin: true }, process.env.SECRET_KEY ?? throwError('SECRET_KEY is not defined')),
);

// eslint-disable-next-line no-console
console.log(url.href);

import 'dotenv/config';
import { throwError } from '@etonee123x/shared/utils/throwError';
import jsonwebtoken from 'jsonwebtoken';
import { KEY_COOKIE_JWT } from '@/constants/keyCookieJwt';

(() => {
  const url = new URL('/ru', 'http://127.0.0.1:5173');

  url.searchParams.set(
    KEY_COOKIE_JWT,
    jsonwebtoken.sign({ isAdmin: true }, process.env.SECRET_KEY ?? throwError('SECRET_KEY is not defined')),
  );

  console.info(url.toString());
})();

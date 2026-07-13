import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // почему то со String.raw некорректно работает
  // eslint-disable-next-line unicorn/prefer-string-raw
  matcher: `/((?!api|trpc|_next|_vercel|.*\\..*).*)`,
};

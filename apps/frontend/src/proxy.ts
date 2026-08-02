import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { client } from '@/lib/api/client';
import { isNil } from '@/lib/utils/is-nil';

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const jwt = request.nextUrl.searchParams.get('jwt');

  if (isNil(jwt)) {
    const response = handleI18nRouting(request);

    const locale = response.headers.get('x-middleware-request-x-next-intl-locale');
    response.headers.set('x-pathname', request.nextUrl.pathname.replace(`/${locale}`, '') || '/');

    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.searchParams.delete('jwt');
  const response = NextResponse.redirect(redirectUrl, 303);

  try {
    const authResponse = await client['/auth'].POST({ params: { query: { jwt } } });
    if (authResponse.error) {
      throw new Error('JWT authentication failed');
    }

    for (const cookie of authResponse.response.headers.getSetCookie()) {
      response.headers.append('Set-Cookie', cookie);
    }
  } catch {
    response.cookies.delete('jwt');
  }

  return response;
}

export const config = {
  matcher: [
    '/explorer/:path*',
    '/:locale/explorer/:path*',
    // eslint-disable-next-line unicorn/prefer-string-raw
    `/((?!api|trpc|uploads|content|_next|_vercel|.*\\..*).*)`,
  ],
};

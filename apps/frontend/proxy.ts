import { NextResponse, NextRequest } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
 
export const DEFAULT_LOCALE = 'en'
const LOCALES = [DEFAULT_LOCALE, 'ru']

function getLocale(request: NextRequest) { 

const languages = new Negotiator({ headers: Object.fromEntries(request.headers.entries()) }).languages()
 
return match(languages, LOCALES, DEFAULT_LOCALE)
 }
 
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
 
  if (pathnameHasLocale) return
 
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}
 
export const config = {
  matcher: [
    '/((?!_next).*)',
  ],
}
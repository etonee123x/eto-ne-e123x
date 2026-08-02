import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { getIsAdmin } from '@/lib/auth/get-is-admin';

import { TheHeader } from './_components/the-header';
import { TheFooter } from './_components/the-footer';
import { ThemeProvider } from './_components/theme-provider';

import { PlayerProvider } from './_components/the-player/player-provider';
import { ThePlayer } from './_components/the-player';

import { GalleryProvider } from './_components/the-gallery/gallery-provider';
import { TheGallery } from './_components/the-gallery';

import { IsAdminContext } from '@/lib/auth/is-admin-context';
// import themes from '@/app/themes.json';

import '@/app/globals.css';

export default async function RootLayout({ children, params }: Readonly<LayoutProps<'/[locale]'>>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const isAdmin = await getIsAdmin();

  // Так надо
  // const themeContent = themes.at(Date.now() % themes.length)?.content;

  return (
    <html className="h-full antialiased" suppressHydrationWarning>
      <body className="flex flex-col min-h-dvh">
        <NextIntlClientProvider>
          <IsAdminContext value={isAdmin}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <PlayerProvider>
                <GalleryProvider>
                  <TheHeader className="fixed top-0 w-full z-1 h-header-height" />
                  <main className="pt-header-height relative flex flex-col flex-1">{children}</main>
                  <ThePlayer />
                  <TheFooter />
                  <TheGallery />
                </GalleryProvider>
              </PlayerProvider>
            </ThemeProvider>
          </IsAdminContext>
        </NextIntlClientProvider>
        {/* <style>{`:root { ${themeContent} }`}</style> */}
      </body>
    </html>
  );
}

import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { getIsAdmin } from '@/lib/auth/get-is-admin';

import { TheHeader } from '@/widgets/the-header';
import { TheFooter } from '@/widgets/the-footer';
import { ThemeProvider } from './_providers/theme-provider';

import { PlayerProvider } from '@/widgets/the-player/player-provider';
import { ThePlayer } from '@/widgets/the-player';

import { GalleryProvider } from '@/widgets/the-gallery/gallery-provider';
import { TheGallery } from '@/widgets/the-gallery';

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

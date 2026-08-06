import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { getIsAdmin, IsAdminContext } from '@/entities/session';

import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';

import { PlayerProvider, Player } from '@/widgets/player';

import { GalleryProvider, Gallery } from '@/widgets/gallery';

// import themes from '@/app/themes.json';

import '@/app/globals.css';
import { ThemeProvider } from '@teispace/next-themes';

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
                  <Header className="fixed top-0 w-full z-1 h-header-height" />
                  <main className="pt-header-height relative flex flex-col flex-1">{children}</main>
                  <Player />
                  <Footer />
                  <Gallery />
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

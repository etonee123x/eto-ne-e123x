import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { routing } from '@/i18n/routing';
import { IsAdminProvider } from '@/entities/session';

import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';

import { PlayerProvider, Player } from '@/widgets/player';

import { Gallery } from '@/shared/lib/gallery';
import { GalleryProvider } from '@/widgets/gallery';

import { getRandomTheme } from '@/app/get-random-theme';

import { ThemeProvider } from '@/features/theme';
import { QueryClientProvider } from '@/shared/api/query';

import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | eto-ne-e123x',
    default: 'eto-ne-e123x', // a default is required when creating a template
  },
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider>
      <IsAdminProvider>
        <QueryClientProvider>
          <ThemeProvider>
            <PlayerProvider>
              <GalleryProvider>{children}</GalleryProvider>
            </PlayerProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </IsAdminProvider>
    </NextIntlClientProvider>
  );
};

export default async function RootLayout({ children, params }: Readonly<LayoutProps<'/[locale]'>>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const theme = getRandomTheme();

  return (
    <html className="h-full antialiased" suppressHydrationWarning>
      <body className="flex flex-col min-h-dvh">
        <Providers>
          <Header className="fixed top-0 w-full z-1 h-header-height" />
          <main className="pt-header-height relative flex flex-col flex-1">{children}</main>
          <Player />
          <Footer />
          <Gallery />
        </Providers>
        <style>{`:root { ${theme.light} } .dark { ${theme.dark} }`}</style>
      </body>
    </html>
  );
}

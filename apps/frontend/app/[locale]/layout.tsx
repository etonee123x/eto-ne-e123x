import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';

import TheHeader from '@/components/the-header';
import TheFooter from '@/components/the-footer';
import { ThemeProvider } from '@/components/theme-provider';

import '../globals.css';

export default async function RootLayout({ children, params }: Readonly<LayoutProps<'/[locale]'>>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html className="h-full antialiased" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div id="app">
              <div className="contents group/app">
                <TheHeader className="fixed top-0 w-full z-1 h-header-height" />
                <main className="pt-header-height relative flex flex-col flex-1">{children}</main>
                <TheFooter />
              </div>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';

import TheHeader from './_components/the-header';
import TheFooter from './_components/the-footer';
import { ThemeProvider } from './_components/theme-provider';

import '@/app/globals.css';
import themes from '@/app/themes.json';

export default async function RootLayout({ children, params }: Readonly<LayoutProps<'/[locale]'>>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Так надо
  // eslint-disable-next-line react-hooks/purity
  const themeContent = themes.at(Date.now() % themes.length)?.content;

  return (
    <html className="h-full antialiased" suppressHydrationWarning>
      <body className="flex flex-col min-h-dvh">
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TheHeader className="fixed top-0 w-full z-1 h-header-height" />
            <main className="pt-header-height relative flex flex-col flex-1">{children}</main>
            <TheFooter />
          </ThemeProvider>
        </NextIntlClientProvider>
        <style>{`:root { ${themeContent} }`}</style>
      </body>
    </html>
  );
}

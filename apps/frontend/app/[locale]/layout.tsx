import TheHeader from '@/components/the-header'
import TheFooter from '@/components/the-footer';

import "./globals.css";
import { LocaleContext } from '@/contexts/locale-context';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
} & LayoutProps<'/[locale]'>>) {
  const {locale} = await params 

  return (
    <LocaleContext value={locale}>
      <html
        lang="en"
        className="h-full antialiased font-sans"
      >
        <body>
          <div id="app">
            <div className="contents group/app">
              <TheHeader className="fixed top-0 w-full z-1 h-header-height" />
              <main className="pt-header-height relative flex flex-col flex-1">
                {children}
                {/* <Suspense suspensible>
                  <RouterView />
                </Suspense> */}
                {/* <!-- TODO: глянуть чо с ними не так --> */}
                {/* <LazyTheNotifications
                  v-if="notifications.notifications.length > 0"
                  className="fixed bottom-4 group-has-data-player/app:bottom-32 mx-auto"
                /> */}
              </main>
              {/* <LazyThePlayer v-if="shouldRenderPlayer" className="sticky bottom-0" />  */}
              <TheFooter />
            </div>
          </div>
        </body>
      </html>
    </LocaleContext>
  );
}
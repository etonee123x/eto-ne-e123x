import { ThemeProvider as _ThemeProvider } from '@teispace/next-themes';

import type { PropsWithChildren } from 'react';

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <_ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </_ThemeProvider>
  );
};

'use client';

import { ThemeProvider as NextThemesProvider } from '@teispace/next-themes';

export const ThemeProvider = ({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

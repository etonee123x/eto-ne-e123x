import { DEFAULT_LOCALE } from '@/proxy';
import { createContext } from 'react';

export const LocaleContext = createContext<string>(DEFAULT_LOCALE);
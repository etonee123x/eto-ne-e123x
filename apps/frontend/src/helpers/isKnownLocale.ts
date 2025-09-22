import { LOCALES_INFO } from '@/constants/localesInfo';

export const isKnownLocale = (parameter: unknown): parameter is (typeof LOCALES_INFO)[number]['locale'] =>
  LOCALES_INFO.some((localeInfo) => localeInfo.locale === parameter);

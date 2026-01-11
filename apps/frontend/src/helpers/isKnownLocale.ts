import { LOCALES_INFO } from '@/constants/localesInfo';

export const isKnownLocale = (parameter: unknown): parameter is (typeof LOCALES_INFO)[number]['locale'] => {
  return LOCALES_INFO.some((localeInfo) => {
    return localeInfo.locale === parameter;
  });
};

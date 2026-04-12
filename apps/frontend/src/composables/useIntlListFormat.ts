import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useLocaleInfo } from './useLocaleInfo';

export const useIntlListFormat = (
  _locales?: MaybeRefOrGetter<Intl.LocalesArgument>,
  options?: MaybeRefOrGetter<Intl.ListFormatOptions>,
) => {
  const localeInfo = useLocaleInfo();

  return computed(() => {
    return new Intl.ListFormat(toValue(_locales) ?? localeInfo.value.locale, toValue(options));
  });
};

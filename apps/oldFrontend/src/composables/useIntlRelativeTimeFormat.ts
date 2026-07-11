import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useLocaleInfo } from './useLocaleInfo';

export const useIntlRelativeTimeFormat = (
  _locales?: MaybeRefOrGetter<Intl.LocalesArgument>,
  options?: MaybeRefOrGetter<Intl.RelativeTimeFormatOptions>,
) => {
  const localeInfo = useLocaleInfo();

  return computed(() => {
    return new Intl.RelativeTimeFormat(toValue(_locales) ?? localeInfo.value.locale, toValue(options));
  });
};

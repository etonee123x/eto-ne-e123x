import { LOCALES_INFO } from '@/constants/localesInfo';
import { i18n } from '@/i18n';
import { nonNullable } from '@/utils/nonNullable';
import { computed } from 'vue';

export const useLocaleInfo = () => {
  return computed(() => {
    console.info('locale:', i18n.global.locale.value);
    return nonNullable(
      LOCALES_INFO.find((localeInfo) => {
        return localeInfo.locale === i18n.global.locale.value;
      }),
    );
  });
};

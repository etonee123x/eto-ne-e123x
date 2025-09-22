import { LOCALES_INFO } from '@/constants/localesInfo';
import { i18n } from '@/i18n';
import { nonNullable } from '@/utils/nonNullable';
import { computed } from 'vue';

export const useLocaleInfo = () =>
  computed(() => nonNullable(LOCALES_INFO.find((localeInfo) => localeInfo.locale === i18n.global.locale.value)));

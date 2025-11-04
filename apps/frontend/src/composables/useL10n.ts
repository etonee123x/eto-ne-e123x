import { type RouteLocationAsRelativeGeneric } from 'vue-router';
import { useLocaleInfo } from './useLocaleInfo';
import { LOCALES_INFO } from '@/constants/localesInfo';
import { propertyCurried } from '@etonee123x/shared/utils/property';

export const useL10n = () => {
  const localeInfo = useLocaleInfo();

  const localizeRoute = (route: RouteLocationAsRelativeGeneric) => ({
    ...route,
    params: {
      language: localeInfo.value.locale.toLocaleLowerCase(),
      ...route.params,
    },
  });

  const localizePath = (path: string) => {
    if (new RegExp(`^/(?:${LOCALES_INFO.map(propertyCurried('locale')).join('|')})/`).test(path)) {
      return path;
    }

    return `/${localeInfo.value.locale.toLocaleLowerCase()}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return {
    localizeRoute,
    localizePath,
  };
};

import { getTranslations } from 'next-intl/server';

export const getSiteImage = async () => {
  const t = await getTranslations('Metadata');

  return {
    url: '/etonee123x.jpg',
    width: 1000,
    height: 1000,
    alt: t('etonee123xSiteLogo'),
  };
};

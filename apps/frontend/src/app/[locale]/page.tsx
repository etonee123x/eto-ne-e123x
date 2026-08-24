import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Index');

  return {
    title: `${t('indexPage')} | etonee123x`,
  };
};

export default async function Home() {
  const t = await getTranslations('Index');

  return (
    <section className="layout-container">
      <h1 className="h1 mb-4">{t('indexPage')}</h1>
      <p className="text-[4px]">{t('yesThereIsNothingHere')}</p>
    </section>
  );
}

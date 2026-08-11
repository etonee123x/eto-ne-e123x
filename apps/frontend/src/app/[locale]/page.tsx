import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Index');

  return {
    title: `${t('indexPage')} | eto-ne-e123x`,
  };
};

export default function Home() {
  return <div>Index</div>;
}

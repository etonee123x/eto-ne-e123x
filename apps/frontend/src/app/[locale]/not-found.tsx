import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/shared/ui/ds/empty';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('NotFound');

  return {
    title: t('pageNotFound'),
    description: t('pageNotFoundItMayHaveBeenRemoved'),
  };
};

export default async function NotFoundPage() {
  const t = await getTranslations('NotFound');

  return (
    <section className="layout-container flex flex-1 flex-col items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h1 className="h1">404</h1>
          </EmptyTitle>
          <EmptyDescription>{t('pageNotFoundItMayHaveBeenRemoved')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className="underline">
            {t('toTheMainPage')}
          </Link>
        </EmptyContent>
      </Empty>
    </section>
  );
}

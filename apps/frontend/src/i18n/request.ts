import { locale as localeRootParameters } from 'next/root-params';

import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const localeParameter = await localeRootParameters();
    if (hasLocale(routing.locales, localeParameter)) {
      locale = localeParameter;
    } else {
      notFound();
    }
  }

  const messagesModule = (await import(`./messages/${locale}.json`)) as { default: object };
  const messages = messagesModule.default;

  return {
    locale,
    messages,
  };
});

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import telegramLogoSource from '../assets/telegram-logo.svg';

const ETO_NE_E123X = 'eto_ne_e123x';

export const Footer = () => {
  const t = useTranslations('TheFooter');

  return (
    <footer className="border-t border-primary">
      <address className="layout-container py-4 flex gap-2 items-center italic">
        <a rel="noopener noreferrer" target="_blank" href={`https://t.me/${ETO_NE_E123X}`} className="flex gap-2">
          {/* См. коммент у переменной */}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Image width="24" height="24" src={telegramLogoSource} alt={t('telegramLogo')} />
          {ETO_NE_E123X}
        </a>
      </address>
    </footer>
  );
};

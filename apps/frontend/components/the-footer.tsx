import { LocaleContext } from "@/contexts/locale-context";
import { useContext } from "react";

const ETO_NE_E123X = 'eto_ne_e123x';

export default function TheFooter() {
  const locale = useContext(LocaleContext)

  return <footer className="border-t border-t-primary-500">
    <address className="layout-container py-4 flex gap-2 items-center italic">
      <a rel="noopener noreferrer" target="_blank" href={`https://t.me/${ETO_NE_E123X}`} className="flex gap-2">
        <img className="size-6" src="@/assets/icons/telegram.svg" alt={t('telegramLogo')} />
        {ETO_NE_E123X}
      </a>
    </address>
  </footer >
}